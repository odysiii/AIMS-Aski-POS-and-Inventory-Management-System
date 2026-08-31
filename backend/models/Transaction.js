// models/Transaction.js
const { ProductModel, prisma } = require('./Product');

const TransactionModel = {
  // Fetch all transactions with items and cashier details
  findAll: async () => {
    return await prisma.transaction.findMany({
      include: {
        items: true,
        cashier: { select: { username: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  // Process checkout, update stock, and emit real-time socket event
  createCheckout: async (payload, io) => {
    const {
      items,
      subtotal,
      discountPercent,
      discountAmount,
      totalAmount,
      paymentMethod,
      cashierId,
    } = payload;

    // 1. Resolve a valid cashierId dynamically (defaults to 5)
    let validCashierId = Number(cashierId) || 5;

    // Check if the target cashier exists in DB to prevent P2003 errors
    const cashierExists = await prisma.user.findUnique({
      where: { id: validCashierId },
    });

    if (!cashierExists) {
      // Grab the first user in the database as a fallback
      const fallbackUser = await prisma.user.findFirst();
      if (!fallbackUser) {
        throw new Error('No user/cashier found in the database.');
      }
      validCashierId = fallbackUser.id;
    }

    // 2. Execute database transaction
    const transaction = await prisma.$transaction(async (tx) => {
      // Create Transaction and line items
      const newTx = await tx.transaction.create({
        data: {
          transactionNo: `TXN-${Date.now()}`,
          subtotal,
          discountPercent: discountPercent || 0,
          discountAmount: discountAmount || 0,
          totalAmount,
          paymentMethod,
          cashierId: validCashierId,
          items: {
            create: items.map((item) => ({
              productId: Number(item.productId),
              name: item.name,
              unitPrice: Number(item.unitPrice),
              quantity: Number(item.quantity),
              subtotal: Number(item.unitPrice) * Number(item.quantity),
            })),
          },
        },
        include: {
          items: true,
          cashier: { select: { username: true } },
        },
      });

      // Decrement product stock in PostgreSQL
      for (const item of items) {
        await tx.product.update({
          where: { id: Number(item.productId) },
          data: { stock: { decrement: Number(item.quantity) } },
        });
      }

      return newTx;
    });

    if (io) {
      io.emit('transaction_created', transaction);
    }

    return transaction;
  },
};

module.exports = TransactionModel;