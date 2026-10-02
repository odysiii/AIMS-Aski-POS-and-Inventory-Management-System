// One-off import of the September 2026 Coop Store sales history under backend/data/ into
// Transaction/TransactionItem. Scope is Coop Store only this month; Coke Talavera/Jazz Eat get
// imported separately whenever their September files arrive.
//
// Unlike every prior month's sales import (May-Aug, which never touched Product.stock because a
// physical recount already corrected it after the fact), September has no recount — stock is
// driven directly by replaying the ledgers. MUST be run AFTER importSeptemberPurchases.js --commit,
// so that month's deliveries are already on the shelf before any of its sales try to deduct from
// it. Every sale line calls changeStock() exactly like a real checkout does (type SALE,
// referenceType Transaction), so these historical StockMovement rows are priced by the Stock
// History ledger the same way a real sale's is. Each historical transaction is committed in its
// own database transaction: if any line in it would drive a product's stock negative (the same
// guard a real checkout has), the WHOLE transaction is skipped and reported — not partially
// applied — so a reviewer can see exactly which paper transaction didn't reconcile.
//
// Usage:
//   node importSeptemberSales.js            dry run — parses everything, prints a report, writes nothing
//   node importSeptemberSales.js --commit   parses, then actually creates Transactions/TransactionItems
//                                            and deducts stock
require('dotenv').config();
const { assertNotProduction } = require('../lib/productionGuard');
assertNotProduction('importSeptemberSales.js');

const path = require('path');
const ExcelJS = require('exceljs');
const { prisma } = require('../../models/Product');
const { changeStock, StockError } = require('../../models/stockLedger');

const COMMIT = process.argv.includes('--commit');
const DATA_DIR = path.join(__dirname, '../../data');
const p = (...parts) => path.join(DATA_DIR, ...parts);

const MAX_BLANK_RUN = 30;
const CASHIER_USERNAME = 'admin';
const STORE_TIMEZONE_NOON_UTC_HOUR = 4; // 12:00 Asia/Manila (UTC+8) == 04:00 UTC
const SALES_FILE = '09. SALES BOOK SEPTEMBER 2026-PRINTING & COOP STORE.xlsx';
const SALES_SHEET = 'SEPT 2026-Convie';
const SOURCE_TAG = 'COOP-2026-09';

// ---------- excel helpers (same as importAugustSales.js) ----------

const cellValue = (raw) => {
  if (raw === null || raw === undefined) return null;
  if (raw instanceof Date) return raw;
  if (typeof raw === 'object') {
    if (raw.result !== undefined) return raw.result;
    if (Array.isArray(raw.richText)) return raw.richText.map((r) => r.text).join('');
    if (raw.text !== undefined) return raw.text;
    return null;
  }
  return raw;
};

const asString = (v) => {
  const cv = cellValue(v);
  return cv === null || cv === undefined ? '' : String(cv).trim();
};

const asNumber = (v) => {
  const cv = cellValue(v);
  if (cv === null || cv === undefined || cv === '') return null;
  const n = Number(cv);
  return Number.isFinite(n) ? n : null;
};

const cleanBarcode = (v) => asString(v).replace(/\s+/g, '');
const normName = (v) => asString(v).toUpperCase().replace(/\s+/g, ' ');

const parseDate = (v) => {
  const cv = cellValue(v);
  if (!cv) return null;
  if (cv instanceof Date) return Number.isNaN(cv.getTime()) ? null : cv;
  const s = String(cv).trim();
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) {
    const d = new Date(Number(m[3]), Number(m[1]) - 1, Number(m[2]));
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
};

const toStoreNoonUtc = (localDate) => {
  const utc = new Date(Date.UTC(localDate.getFullYear(), localDate.getMonth(), localDate.getDate(), STORE_TIMEZONE_NOON_UTC_HOUR, 0, 0));
  return utc;
};

async function openWorkbook(filePath) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(filePath);
  return wb;
}

function buildHeaderMap(sheet, anchorHeader) {
  const anchor = anchorHeader.toUpperCase();
  for (let r = 1; r <= 10; r++) {
    const row = sheet.getRow(r);
    for (let c = 1; c <= 6; c++) {
      if (asString(row.getCell(c).value).toUpperCase() === anchor) {
        const map = {};
        const maxC = Math.max(sheet.columnCount, 20);
        for (let cc = 1; cc <= maxC; cc++) {
          const h = asString(row.getCell(cc).value).toUpperCase();
          if (h && map[h] === undefined) map[h] = cc;
        }
        return { headerRow: r, map };
      }
    }
  }
  throw new Error(`Could not find header row (looked for "${anchorHeader}") in sheet "${sheet.name}"`);
}

const col = (map, ...candidates) => {
  for (const c of candidates) {
    const key = c.toUpperCase();
    if (map[key] !== undefined) return map[key];
  }
  return null;
};

function* dataRows(sheet, headerRow) {
  let blankRun = 0;
  const lastCol = Math.max(sheet.columnCount, 20);
  for (let r = headerRow + 1; r <= sheet.rowCount; r++) {
    const row = sheet.getRow(r);
    let isBlank = true;
    for (let c = 1; c <= lastCol; c++) {
      if (asString(row.getCell(c).value) !== '') {
        isBlank = false;
        break;
      }
    }
    if (isBlank) {
      blankRun += 1;
      if (blankRun >= MAX_BLANK_RUN) return;
      continue;
    }
    blankRun = 0;
    yield row;
  }
}

// ---------- source parser ----------

function parseSalesSheet(sheet, sourceTag) {
  const { headerRow, map } = buildHeaderMap(sheet, 'DATE');
  const cDate = col(map, 'DATE');
  const cBarcode = col(map, 'PARTICULAR');
  const cTxn = col(map, 'TRANSACTION NO:', 'TRANSACTION');
  const cName = col(map, 'DESCRIPTION');
  const cQty = col(map, 'QTY.', 'QTY');
  const cPrice = col(map, 'UNIT PRICE', 'SRP');
  const cDiscount = col(map, 'SALES DISCOUNT');

  const rows = [];
  let skippedNoDate = 0;
  let skippedNoTxn = 0;
  let skippedBadQty = 0;
  let yearTyposFixed = 0;
  let lastTxnNo = null;
  for (const row of dataRows(sheet, headerRow)) {
    let date = parseDate(row.getCell(cDate).value);
    const explicitTxnNo = asString(row.getCell(cTxn).value);
    const name = asString(row.getCell(cName).value);
    if (!name) continue;
    if (!date) {
      skippedNoDate += 1;
      continue;
    }
    if (date.getFullYear() !== 2026) {
      date = new Date(2026, date.getMonth(), date.getDate());
      yearTyposFixed += 1;
    }
    if (explicitTxnNo) lastTxnNo = explicitTxnNo;
    const txnNo = lastTxnNo;
    if (!txnNo) {
      skippedNoTxn += 1;
      continue;
    }
    const qty = asNumber(row.getCell(cQty).value);
    const unitPrice = asNumber(row.getCell(cPrice).value);
    if (!qty || qty <= 0 || unitPrice === null || unitPrice < 0) {
      skippedBadQty += 1;
      continue;
    }
    const discount = asNumber(row.getCell(cDiscount).value) || 0;
    rows.push({ sourceTag, date, txnNo, barcode: cleanBarcode(row.getCell(cBarcode).value), name, qty, unitPrice, discount });
  }
  return { rows, skippedNoDate, skippedNoTxn, skippedBadQty, yearTyposFixed };
}

async function parseCoopSeptember() {
  const wb = await openWorkbook(p('SALES', SALES_FILE));
  const sheet = wb.getWorksheet(SALES_SHEET);
  if (!sheet) throw new Error(`Sheet "${SALES_SHEET}" not found in ${SALES_FILE}`);
  return parseSalesSheet(sheet, SOURCE_TAG);
}

// ---------- transaction grouping ----------

function groupIntoTransactions(allRows) {
  const groups = new Map();
  for (const row of allRows) {
    const key = `${row.sourceTag}|${row.txnNo}`;
    if (!groups.has(key)) groups.set(key, { sourceTag: row.sourceTag, txnNo: row.txnNo, date: row.date, lines: [] });
    groups.get(key).lines.push(row);
  }
  return [...groups.values()];
}

// ---------- main ----------

async function main() {
  console.log(COMMIT ? 'Running in COMMIT mode — this will write to the database and deduct stock.\n' : 'Running in DRY RUN mode — no database writes.\n');

  const coop = await parseCoopSeptember();
  console.log('=== Parsed rows ===');
  console.log(
    `Coop Store — September 2026: ${coop.rows.length} line items` +
      (coop.skippedNoDate || coop.skippedNoTxn || coop.skippedBadQty
        ? ` (skipped: ${coop.skippedNoDate} no date, ${coop.skippedNoTxn} no txn#, ${coop.skippedBadQty} bad qty/price)`
        : '') +
      (coop.yearTyposFixed ? ` [${coop.yearTyposFixed} year typo(s) corrected to 2026]` : ''),
  );

  const allRows = coop.rows;

  const products = await prisma.product.findMany({ select: { id: true, barcode: true, name: true, stock: true } });
  const byBarcode = new Map(products.filter((pr) => pr.barcode).map((pr) => [pr.barcode, pr]));
  const byName = new Map();
  for (const pr of products) {
    const key = normName(pr.name);
    if (!byName.has(key)) byName.set(key, pr);
  }

  let matchedByBarcode = 0;
  let matchedByName = 0;
  const unmatched = [];
  for (const row of allRows) {
    let product = row.barcode ? byBarcode.get(row.barcode) : null;
    if (product) {
      matchedByBarcode += 1;
    } else {
      product = byName.get(normName(row.name));
      if (product) matchedByName += 1;
    }
    row.product = product || null;
    if (!product) unmatched.push(row);
  }

  console.log(`\nMatched by barcode: ${matchedByBarcode}`);
  console.log(`Matched by product name (barcode missing/unrecognized): ${matchedByName}`);
  console.log(`Unmatched (no product found — will be excluded): ${unmatched.length}`);
  if (unmatched.length) {
    const sample = new Map();
    for (const r of unmatched) {
      const key = `${r.barcode || '(no barcode)'} ${r.name}`;
      sample.set(key, (sample.get(key) || 0) + 1);
    }
    console.log('  examples:', [...sample.entries()].slice(0, 10).map(([k, n]) => `${k} x${n}`).join(' | '));
  }

  const groups = groupIntoTransactions(allRows);
  const transactions = [];
  let droppedEmptyTransactions = 0;
  for (const g of groups) {
    const lines = g.lines.filter((r) => r.product);
    if (lines.length === 0) {
      droppedEmptyTransactions += 1;
      continue;
    }
    let subtotal = 0;
    let discountAmount = 0;
    for (const line of lines) {
      subtotal += Math.round(line.qty * line.unitPrice * 100) / 100;
      discountAmount += Math.round(line.discount * 100) / 100;
    }
    subtotal = Math.round(subtotal * 100) / 100;
    discountAmount = Math.max(0, Math.round(discountAmount * 100) / 100);
    const totalAmount = Math.max(0, Math.round((subtotal - discountAmount) * 100) / 100);
    transactions.push({
      transactionNo: `HIST-${g.sourceTag}-${g.txnNo}`,
      createdAt: toStoreNoonUtc(g.date),
      subtotal,
      discountAmount,
      totalAmount,
      lines,
    });
  }

  console.log(`\n=== Transactions to import ===`);
  console.log(`Total transactions: ${transactions.length}`);
  console.log(`Transactions dropped (every line unmatched): ${droppedEmptyTransactions}`);
  const totalItems = transactions.reduce((sum, t) => sum + t.lines.length, 0);
  console.log(`Total line items: ${totalItems}`);
  const grossTotal = transactions.reduce((sum, t) => sum + t.totalAmount, 0);
  console.log(`Total net sales value: ₱${grossTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

  const txnNoSet = new Set();
  const dupes = [];
  for (const t of transactions) {
    if (txnNoSet.has(t.transactionNo)) dupes.push(t.transactionNo);
    txnNoSet.add(t.transactionNo);
  }
  console.log(`\nDuplicate transactionNo within this import: ${dupes.length}`);
  if (dupes.length) console.log('  examples:', dupes.slice(0, 5));

  if (!COMMIT) {
    console.log('\nDry run complete. Re-run with --commit to write these to the database.');
    console.log('Reminder: run importSeptemberPurchases.js --commit first if you haven\'t already.');
    return;
  }

  console.log('\n=== Committing to database ===');
  const cashier = await prisma.user.findUnique({ where: { username: CASHIER_USERNAME } });
  if (!cashier) throw new Error(`Cashier account "${CASHIER_USERNAME}" not found`);

  const existing = await prisma.transaction.findMany({
    where: { transactionNo: { in: transactions.map((t) => t.transactionNo) } },
    select: { transactionNo: true },
  });
  const existingSet = new Set(existing.map((t) => t.transactionNo));
  const toCreate = transactions.filter((t) => !existingSet.has(t.transactionNo));
  console.log(`Skipping ${transactions.length - toCreate.length} transactions that already exist (re-run safety).`);

  let created = 0;
  let createdItems = 0;
  const skippedInsufficientStock = [];

  for (const t of toCreate) {
    try {
      await prisma.$transaction(
        async (tx) => {
          const newTx = await tx.transaction.create({
            data: {
              transactionNo: t.transactionNo,
              subtotal: t.subtotal,
              discountAmount: t.discountAmount,
              discountPercent: 0,
              supervisorAuthorized: false,
              totalAmount: t.totalAmount,
              paymentMethod: 'CASH',
              cashierId: cashier.id,
              createdAt: t.createdAt,
            },
          });

          for (const line of t.lines) {
            await tx.transactionItem.create({
              data: {
                transactionId: newTx.id,
                productId: line.product.id,
                barcode: line.product.barcode,
                name: line.product.name,
                unitPrice: line.unitPrice,
                quantity: line.qty,
                subtotal: Math.round(line.qty * line.unitPrice * 100) / 100,
              },
            });

            // Same guard a real checkout has: refuses to let stock go negative. If this throws,
            // the whole transaction (including the rows just created above) rolls back.
            await changeStock(tx, {
              productId: line.product.id,
              delta: -line.qty,
              type: 'SALE',
              referenceType: 'Transaction',
              referenceId: newTx.id,
              referenceNo: newTx.transactionNo,
              userId: cashier.id,
            });
          }
        },
        { timeout: 60000, maxWait: 30000 },
      );
      created += 1;
      createdItems += t.lines.length;
    } catch (error) {
      if (error instanceof StockError) {
        skippedInsufficientStock.push({ transactionNo: t.transactionNo, reason: error.message });
      } else {
        throw error;
      }
    }
  }

  console.log(`\nCreated ${created} transactions, ${createdItems} transaction items.`);
  console.log(`Skipped ${skippedInsufficientStock.length} transaction(s) — insufficient stock (flagged for manual review):`);
  for (const s of skippedInsufficientStock.slice(0, 20)) console.log(`  ${s.transactionNo}: ${s.reason}`);
  if (skippedInsufficientStock.length > 20) console.log(`  ...and ${skippedInsufficientStock.length - 20} more.`);
  console.log('Product.stock WAS deducted for every committed transaction — unlike May-Aug sales imports.');
}

main()
  .catch((error) => {
    console.error('Import failed:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
