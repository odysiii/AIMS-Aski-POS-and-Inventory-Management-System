// One-off import of the September 2026 Coop Store purchase book under backend/data/ into
// Product/Supplier/StockMovement. Unlike every prior month, there is no September physical
// inventory recount to correct stock to — so this script (and importSeptemberSales.js, which must
// run AFTER this one) drives stock directly from the purchase/sales ledgers instead. Scope is Coop
// Store only this month; Coke Talavera/Jazz Eat get imported separately whenever their September
// files arrive.
//
// Each purchase line becomes one PURCHASE_RECEIPT StockMovement (+stock on the matched product) —
// the same lightweight pattern used for OPENING/ADJUSTMENT in every prior month's import, not a
// synthesized PurchaseOrder/ReceivingReport (those require a PO numbering scheme, a "receivedBy"
// user, and the model's VAT-aware totals, none of which existed when this book was recorded). No
// StockBatch row is created either, for the same reason every prior month doesn't have one —
// models/stockBatches.js's consumeFIFO already falls back gracefully to unbatched costing for
// stock that predates batch tracking, so this is a pre-existing, already-handled gap, not a new one.
//
// Existing products: stock is incremented by each matching purchase line; costPrice is updated to
// the latest-dated September unit cost seen for that barcode (continuing the "always refresh cost/
// price to the newest document's values" policy from every prior month).
// Brand-new barcodes (not yet in the catalog): a fresh Product is created (category/unit/minStock
// at schema defaults), priced from an observed September sale (by matching product name against
// the September Convie sales sheet) or, failing that, from its own purchase unit cost — same
// fallback chain importRealData.js used for July's baseline. Supplier is resolved by matching the
// purchase book's PARTICULARS name against existing suppliers (ignoring case/spacing), or created
// as a name-only supplier if no match, same as every prior month.
//
// Usage:
//   node importSeptemberPurchases.js            dry run — prints a report, writes nothing
//   node importSeptemberPurchases.js --commit   parses, then actually writes stock/products/suppliers
require('dotenv').config();
const { assertNotProduction } = require('../lib/productionGuard');
assertNotProduction('importSeptemberPurchases.js');

const path = require('path');
const ExcelJS = require('exceljs');
const { prisma } = require('../../models/Product');
const { changeStock } = require('../../models/stockLedger');
const { cleanSupplierName, supplierNameKey } = require('../../services/supplierName');

const COMMIT = process.argv.includes('--commit');
const DATA_DIR = path.join(__dirname, '../../data');
const p = (...parts) => path.join(DATA_DIR, ...parts);

const MAX_BLANK_RUN = 30;
const REFERENCE_TYPE = 'PurchaseImport';

// ---------- excel helpers (same as every prior one-off import script) ----------

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

// ---------- source parsers ----------

// The workbook's own sheet name has a trailing space ("SEPT 2026-COOP STORE ") — confirmed by
// listing the workbook's sheets before writing this script; don't "fix" it to match the file.
const PURCHASES_FILE = '09. PURCHASES BOOK SEPTEMBER 2026-PRINTING & COOP STORE.xlsx';
const PURCHASES_SHEET = 'SEPT 2026-COOP STORE ';
const SALES_FILE = '09. SALES BOOK SEPTEMBER 2026-PRINTING & COOP STORE.xlsx';
const SALES_SHEET = 'SEPT 2026-Convie';

async function parseSeptemberPurchases() {
  const wb = await openWorkbook(p('PURCHASES', PURCHASES_FILE));
  const sheet = wb.getWorksheet(PURCHASES_SHEET);
  if (!sheet) throw new Error(`Sheet "${PURCHASES_SHEET}" not found in ${PURCHASES_FILE}`);
  const { headerRow, map } = buildHeaderMap(sheet, 'DATE');
  const cDate = col(map, 'DATE');
  const cSupplier = col(map, 'PARTICULARS');
  const cCv = col(map, 'CV NO.', 'CV NO');
  const cBarcode = col(map, 'BARCODE');
  const cName = col(map, 'DESCRIPTION');
  const cQty = col(map, 'QTY');
  const cUnitCost = col(map, 'UNIT PRICE');

  const rows = [];
  let skippedNoDate = 0;
  let skippedBadQty = 0;
  let skippedNoBarcode = 0;
  let rowIndex = 0;
  for (const row of dataRows(sheet, headerRow)) {
    const name = asString(row.getCell(cName).value);
    if (!name) continue; // blank/subtotal/signature rows
    const date = parseDate(row.getCell(cDate).value);
    if (!date) {
      skippedNoDate += 1;
      continue;
    }
    const qty = asNumber(row.getCell(cQty).value);
    const unitCost = asNumber(row.getCell(cUnitCost).value);
    if (!qty || qty <= 0 || unitCost === null || unitCost < 0) {
      skippedBadQty += 1;
      continue;
    }
    const barcode = cleanBarcode(row.getCell(cBarcode).value);
    if (!barcode) {
      skippedNoBarcode += 1;
      continue;
    }
    const supplierName = asString(row.getCell(cSupplier).value);
    const cvNo = asString(row.getCell(cCv).value);
    rows.push({ rowIndex, date, supplierName, cvNo, barcode, name, qty, unitCost });
    rowIndex += 1;
  }
  return { rows, skippedNoDate, skippedBadQty, skippedNoBarcode };
}

// normalizedProductName -> { price, date } (latest date wins), from September's own Coop sales —
// used only as a price source for brand-new products discovered via this purchase book.
async function collectSeptemberPriceLookup() {
  const lookup = new Map();
  const wb = await openWorkbook(p('SALES', SALES_FILE));
  const sheet = wb.getWorksheet(SALES_SHEET);
  if (!sheet) return lookup;
  const { headerRow, map } = buildHeaderMap(sheet, 'DATE');
  const cDate = col(map, 'DATE');
  const cName = col(map, 'DESCRIPTION');
  const cPrice = col(map, 'UNIT PRICE');
  for (const row of dataRows(sheet, headerRow)) {
    const name = normName(row.getCell(cName).value);
    const price = asNumber(row.getCell(cPrice).value);
    if (!name || price === null || price <= 0) continue;
    const date = parseDate(row.getCell(cDate).value) || new Date(0);
    const existing = lookup.get(name);
    if (!existing || date >= existing.date) lookup.set(name, { price, date });
  }
  return lookup;
}

// ---------- main ----------

async function main() {
  console.log(COMMIT ? 'Running in COMMIT mode — this will write to the database.\n' : 'Running in DRY RUN mode — no database writes.\n');

  const [{ rows, skippedNoDate, skippedBadQty, skippedNoBarcode }, priceLookup] = await Promise.all([
    parseSeptemberPurchases(),
    collectSeptemberPriceLookup(),
  ]);

  console.log('=== Parsed purchase lines ===');
  console.log(
    `Coop Store — September 2026: ${rows.length} line items` +
      (skippedNoDate || skippedBadQty || skippedNoBarcode
        ? ` (skipped: ${skippedNoDate} no date, ${skippedBadQty} bad qty/cost, ${skippedNoBarcode} no barcode)`
        : ''),
  );

  const products = await prisma.product.findMany({ select: { id: true, barcode: true, costPrice: true } });
  const byBarcode = new Map(products.filter((pr) => pr.barcode).map((pr) => [pr.barcode, pr]));

  const suppliers = await prisma.supplier.findMany();
  const supplierIdByKey = new Map(suppliers.map((s) => [supplierNameKey(s.name), s.id]));

  // latest-dated unit cost per barcode, across every September row (matched or brand-new)
  const latestCostByBarcode = new Map();
  for (const row of rows) {
    const existing = latestCostByBarcode.get(row.barcode);
    if (!existing || row.date >= existing.date) latestCostByBarcode.set(row.barcode, { cost: row.unitCost, date: row.date });
  }

  const matchedRows = [];
  const newBarcodeRows = [];
  for (const row of rows) {
    if (byBarcode.has(row.barcode)) matchedRows.push(row);
    else newBarcodeRows.push(row);
  }

  const newBarcodes = [...new Set(newBarcodeRows.map((r) => r.barcode))];
  console.log(`\nMatched existing products: ${matchedRows.length} line items`);
  console.log(`Brand-new barcodes to create: ${newBarcodes.length} (${newBarcodeRows.length} line items)`);

  const costChanges = [...new Set(matchedRows.map((r) => r.barcode))].filter((bc) => {
    const latest = latestCostByBarcode.get(bc);
    const current = Number(byBarcode.get(bc).costPrice);
    return latest && Math.abs(latest.cost - current) > 0.01;
  });
  console.log(`Existing products needing a costPrice update: ${costChanges.length}`);

  const totalQty = rows.reduce((sum, r) => sum + r.qty, 0);
  const totalValue = rows.reduce((sum, r) => sum + r.qty * r.unitCost, 0);
  console.log(`Total units: ${totalQty.toLocaleString()} | Total value: ₱${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

  if (!COMMIT) {
    console.log('\nDry run complete. Re-run with --commit to write these to the database.');
    return;
  }

  console.log('\n=== Committing to database ===');

  // re-run safety: each row gets a stable referenceNo; skip any row already applied by a prior run
  const candidateRefs = rows.map((r) => `SEPT2026-ROW-${r.rowIndex}`);
  const existingMovements = await prisma.stockMovement.findMany({
    where: { referenceType: REFERENCE_TYPE, referenceNo: { in: candidateRefs } },
    select: { referenceNo: true },
  });
  const alreadyApplied = new Set(existingMovements.map((m) => m.referenceNo));

  // ---- create brand-new products first, so every row below can resolve a productId ----
  let suppliersCreated = 0;
  let productsCreated = 0;
  for (const barcode of newBarcodes) {
    const sampleRow = newBarcodeRows.find((r) => r.barcode === barcode);
    const key = normName(sampleRow.name);
    const priceHit = priceLookup.get(key);
    const latestCost = latestCostByBarcode.get(barcode).cost;
    const price = priceHit ? priceHit.price : latestCost;

    let supplierId = null;
    if (sampleRow.supplierName) {
      const skey = supplierNameKey(sampleRow.supplierName);
      supplierId = supplierIdByKey.get(skey) || null;
      if (!supplierId) {
        const createdSupplier = await prisma.supplier.create({ data: { name: cleanSupplierName(sampleRow.supplierName) } });
        supplierIdByKey.set(skey, createdSupplier.id);
        supplierId = createdSupplier.id;
        suppliersCreated += 1;
      }
    }

    const product = await prisma.product.create({
      data: {
        name: sampleRow.name.slice(0, 255),
        barcode,
        price: Math.max(0, Math.round(price * 100) / 100),
        costPrice: Math.max(0, Math.round(latestCost * 100) / 100),
        stock: 0,
        supplierId,
      },
    });
    byBarcode.set(barcode, { id: product.id, barcode, costPrice: product.costPrice });
    productsCreated += 1;
  }
  console.log(`Created ${productsCreated} brand-new products (${suppliersCreated} new suppliers).`);

  // ---- apply every row as its own PURCHASE_RECEIPT movement, in manageable chunks ----
  const CHUNK = 100;
  let applied = 0;
  let skippedRerun = 0;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK).filter((r) => !alreadyApplied.has(`SEPT2026-ROW-${r.rowIndex}`));
    skippedRerun += rows.slice(i, i + CHUNK).length - chunk.length;
    if (chunk.length === 0) continue;
    await prisma.$transaction(
      async (tx) => {
        for (const row of chunk) {
          const product = byBarcode.get(row.barcode);
          await changeStock(tx, {
            productId: product.id,
            delta: row.qty,
            type: 'PURCHASE_RECEIPT',
            reason: 'September 2026 purchase book import',
            referenceType: REFERENCE_TYPE,
            referenceNo: `SEPT2026-ROW-${row.rowIndex}`,
            userId: null,
          });
        }
      },
      { timeout: 120000, maxWait: 30000 },
    );
    applied += chunk.length;
    console.log(`  applied ${applied}/${rows.length - skippedRerun}...`);
  }
  console.log(`\nApplied ${applied} purchase lines (${skippedRerun} already applied by a prior run, skipped).`);

  // ---- cost updates for existing products ----
  let costUpdated = 0;
  for (const barcode of costChanges) {
    const product = byBarcode.get(barcode);
    const latest = latestCostByBarcode.get(barcode);
    await prisma.product.update({ where: { id: product.id }, data: { costPrice: Math.max(0, Math.round(latest.cost * 100) / 100) } });
    costUpdated += 1;
  }
  console.log(`Updated costPrice for ${costUpdated} existing products.`);
}

main()
  .catch((error) => {
    console.error('Import failed:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
