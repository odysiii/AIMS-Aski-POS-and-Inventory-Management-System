// Voiding a completed sale. The original Transaction is never changed or deleted: the void is its
// own record (SaleVoid), and everything it undoes is recorded as new entries —
//   - each item goes back into the exact FIFO batches the sale drew from, and a VOID stock
//     movement puts the quantity back on the shelf (so the ledger shows both the sale and the void);
//   - points the sale earned are taken back with a VOID entry in the member's points ledger.
// A void counts on the day it happens (see Reconciliation/ZReading/Transaction.findForReport), so
// earlier reports and printed readings stay as they were.
const { prisma } = require('./Product');
const { changeStock } = require('./stockLedger');
const { STORE_TIMEZONE, localDate } = require('./DemandForecast');
const { FLOOR_DATE } = require('./ReconciliationReport');

class VoidError extends Error {
  constructor(status, message, code = 'VOID_REJECTED') {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const MAX_REASON_LENGTH = 255;
const RECENT_LIMIT = 50;
const SEARCH_LIMIT = 20;

// V-YYYYMMDD-#### — same convention as Z-YYYYMMDD-#### and the PO/RR/PR numbers.
const generateVoidNo = (id, date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `V-${y}${m}${d}-${String(id).padStart(4, '0')}`;
};

// Sales from the May–July 2026 import predate AIMS: they have no stock ledger or batch records,
// so there is nothing to reverse accurately.
const isImported = (createdAt) => localDate(createdAt, STORE_TIMEZONE) < FLOOR_DATE;

const voidInclude = {
  transaction: {
    include: {
      items: { orderBy: { id: 'asc' } },
      cashier: { select: { username: true } },
      member: { select: { name: true, cardNumber: true } },
    },
  },
  voidedBy: { select: { username: true } },
  approvedBy: { select: { username: true } },
};

const SaleVoidModel = {
  // Voids one sale. `voidedById` is the signed-in POS user; `approvedById` the supervisor whose PIN
  // produced the VOID approval token. Returns { saleVoid, productIds } (productIds: whose stock changed).
  create: async ({ transactionId, reason, voidedById, approvedById }) => {
    const id = parseInt(transactionId, 10);
    if (!id) throw new VoidError(400, 'Choose a sale to void.');
    const cleanReason = typeof reason === 'string' ? reason.trim() : '';
    if (!cleanReason) throw new VoidError(400, 'A reason is required to void a sale.', 'REASON_REQUIRED');
    if (cleanReason.length > MAX_REASON_LENGTH) {
      throw new VoidError(400, `Keep the reason under ${MAX_REASON_LENGTH} characters.`);
    }

    const { voidId, productIds } = await prisma.$transaction(
      async (tx) => {
        // Row lock: two cashiers voiding the same sale at once can't both get past the check below.
        const locked = await tx.$queryRaw`SELECT id FROM "Transaction" WHERE id = ${id} FOR UPDATE`;
        if (locked.length === 0) throw new VoidError(404, 'Sale not found.', 'NOT_FOUND');

        const sale = await tx.transaction.findUnique({
          where: { id },
          include: {
            items: { include: { batchConsumptions: true }, orderBy: { id: 'asc' } },
            pointsLedger: true,
            saleVoid: { select: { voidNo: true } },
          },
        });
        if (sale.saleVoid) {
          throw new VoidError(409, `This sale was already voided (${sale.saleVoid.voidNo}).`, 'ALREADY_VOIDED');
        }
        if (isImported(sale.createdAt)) {
          throw new VoidError(
            400,
            `Sales imported from before AIMS went live (before ${FLOOR_DATE}) can't be voided.`,
            'IMPORTED_SALE',
          );
        }

        const earned = sale.pointsLedger
          .filter((p) => p.type === 'EARN')
          .reduce((sum, p) => sum + Number(p.points), 0);

        const created = await tx.saleVoid.create({
          data: {
            voidNo: `TEMP-${Date.now()}-${id}`,
            transactionId: id,
            voidedById,
            approvedById,
            reason: cleanReason,
            subtotal: sale.subtotal,
            discountAmount: sale.discountAmount,
            totalAmount: sale.totalAmount,
            paymentMethod: sale.paymentMethod,
            pointsReversed: earned,
          },
        });
        const voidNo = generateVoidNo(created.id, created.createdAt);
        await tx.saleVoid.update({ where: { id: created.id }, data: { voidNo } });

        for (const item of sale.items) {
          // Back into the batches this line actually came from. Any unbatched part (a costing gap
          // at sale time) only ever existed as Product.stock, so restoring the stock below is its
          // exact reversal.
          for (const c of item.batchConsumptions) {
            if (c.batchId) {
              await tx.stockBatch.update({ where: { id: c.batchId }, data: { qtyRemaining: { increment: c.quantity } } });
            }
          }
          await changeStock(tx, {
            productId: item.productId,
            delta: item.quantity,
            type: 'VOID',
            reason: `Void of ${sale.transactionNo}`,
            referenceType: 'SaleVoid',
            referenceId: created.id,
            referenceNo: voidNo,
            userId: voidedById,
          });
        }

        if (sale.memberId && earned > 0) {
          const member = await tx.member.update({
            where: { id: sale.memberId },
            data: { points: { decrement: earned } },
          });
          await tx.memberPointsLedger.create({
            data: { memberId: sale.memberId, transactionId: id, type: 'VOID', points: -earned, balanceAfter: member.points },
          });
        }

        return { voidId: created.id, productIds: [...new Set(sale.items.map((i) => i.productId))] };
      },
      { timeout: 20000 },
    );

    return { saleVoid: await SaleVoidModel.findById(voidId), productIds };
  },

  findById: async (id) => {
    const voidId = parseInt(id, 10);
    if (!voidId) return null;
    return prisma.saleVoid.findUnique({ where: { id: voidId }, include: voidInclude });
  },

  // What the void receipt needs (receiptLayout.buildVoidReceipt), or null.
  findReceiptData: async (id) => {
    const v = await SaleVoidModel.findById(id);
    if (!v) return null;
    const t = v.transaction;
    return {
      id: v.id,
      voidNo: v.voidNo,
      transactionNo: t.transactionNo,
      soldAt: t.createdAt,
      voidedAt: v.createdAt,
      cashier: t.cashier.username,
      voidedBy: v.voidedBy.username,
      approver: v.approvedBy.username,
      member: t.member ? { name: t.member.name, cardNumber: t.member.cardNumber } : null,
      items: t.items.map((i) => ({ name: i.name, quantity: i.quantity, unitPrice: Number(i.unitPrice) })),
      subtotal: Number(v.subtotal),
      discountAmount: Number(v.discountAmount),
      totalAmount: Number(v.totalAmount),
      reason: v.reason,
    };
  },

  // The POS "Void Sale" picker. With no search: the signed-in user's own sales since their last
  // Z-Reading (their open shift), newest first. With a search: any sale whose transaction number
  // contains it. Each row says whether it can be voided and, if not, why.
  listForPos: async ({ userId, search }) => {
    const term = typeof search === 'string' ? search.trim() : '';
    let where;
    let take;
    if (term) {
      where = { transactionNo: { contains: term, mode: 'insensitive' } };
      take = SEARCH_LIMIT;
    } else {
      const lastZ = await prisma.zReadingLog.findFirst({
        where: { cashierId: userId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      });
      where = { cashierId: userId, ...(lastZ ? { createdAt: { gt: lastZ.createdAt } } : {}) };
      take = RECENT_LIMIT;
    }

    const sales = await prisma.transaction.findMany({
      where,
      include: {
        items: { select: { name: true, quantity: true, unitPrice: true, subtotal: true }, orderBy: { id: 'asc' } },
        cashier: { select: { username: true } },
        member: { select: { name: true, cardNumber: true } },
        saleVoid: { select: { id: true, voidNo: true, createdAt: true } },
      },
      orderBy: { createdAt: 'desc' },
      take,
    });

    return sales.map((t) => {
      const imported = isImported(t.createdAt);
      return {
        id: t.id,
        transactionNo: t.transactionNo,
        createdAt: t.createdAt,
        cashier: t.cashier.username,
        member: t.member,
        paymentMethod: t.paymentMethod,
        subtotal: Number(t.subtotal),
        discountAmount: Number(t.discountAmount),
        totalAmount: Number(t.totalAmount),
        items: t.items.map((i) => ({ name: i.name, quantity: i.quantity, unitPrice: Number(i.unitPrice), subtotal: Number(i.subtotal) })),
        saleVoid: t.saleVoid,
        voidable: !t.saleVoid && !imported,
        notVoidableReason: t.saleVoid
          ? `Already voided (${t.saleVoid.voidNo})`
          : imported
            ? 'Imported sale (before AIMS went live)'
            : null,
      };
    });
  },
};

SaleVoidModel.VoidError = VoidError;

module.exports = { SaleVoidModel, VoidError };
