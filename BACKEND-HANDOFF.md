# Backend Handoff — Project AIMS Frontend Pass

This document lists everything the frontend pass on 2026-08-14 proved is needed
but could not build because scope was frontend-only. Items are ordered by
business impact; each links to the frontend code that already handles it
correctly once the backend contract lands.

## 1. Prevent negative stock (server-side guard)

**Problem.** `backend/models/Transaction.js` decrements product stock without a
`stock >= quantity` check inside the `$transaction`, so two concurrent
cashiers can each pass a client-side stock check and both commit — stock goes
negative. The July 1 consultation names double-selling as a core problem, and
July 31 explicitly requires "must inhibit negative stock counts once inventory
levels are depleted."

**Fix.** Inside `createCheckout`, before the decrement, do a `SELECT … FOR
UPDATE` on each product row (Prisma raw or `tx.$queryRaw`) and reject the
whole transaction if any row has insufficient stock. Return HTTP 409 with a
per-item breakdown so the POS can surface exactly which product is short.

**Frontend readiness.** `cashierPOS.jsx` already refetches products right
before checkout and re-validates each cart line. This narrows the race but
does not close it — polling is a mitigation, not a guarantee.

## 2. Real authentication endpoint

**Problem.** The frontend has a full `AuthContext` / `RequireAuth` / role-based
routing layer, but there is no `POST /api/auth/login` on the backend. Today
it runs in `VITE_AUTH_MODE=dev` against `src/auth/devUsers.js`.

**Fix.**
- `POST /api/auth/login` accepting `{ username, password }` → returns
  `{ id, username, role }`. Passwords must be bcrypt-hashed on the `User`
  model (currently stored plaintext per `schema.prisma`).
- Seed one user per role: ADMIN, SUPERVISOR, CASHIER, ACCOUNTING, INVENTORY.
- Optional but recommended: `POST /api/auth/authorize-supervisor` for the
  POS discount flow. `AuthContext.authorizeSupervisor` already tries this
  endpoint and falls back gracefully on 404, so it's opt-in.

**Frontend readiness.** Flip `.env` to `VITE_AUTH_MODE=api`. Zero code changes.

## 3. Product CRUD endpoints

**Problem.** `POST/PUT/DELETE /api/products` do not exist. The Inventory Add
Product form has no place to save.

**Fix.** Standard REST — `POST`, `PUT /:id`, `DELETE /:id` against
`prisma.product`.

**Frontend readiness.** `inventoryList.jsx`'s submit handler is wired but
short-circuits with a toast pointing at this handoff item. Replace one line
with `apiPost('/api/products', formData)` when the route ships.

## 4. Product schema expansion

**Problem.** The Inventory form and the July 31 consultation both require
batch/expiry tracking. The Product model has only `id, name, price, category,
stock, sku`. Five of nine form fields have no column, the Expiry Watchlist on
the dashboard is unwireable, and expiry-based Fifo / spoilage tracking cannot
begin.

**Fix.** Add to `Product`:

- `barcode String? @unique` — **already referenced** by
  `ProductModel.findByBarcode()` in `backend/models/Product.js`. The
  `/api/products/barcode/:code` route 500s today because the column is
  missing. The POS barcode scan input is wired but always fails.
- `batchNo String?`
- `arrivalDate DateTime?`
- `expiryDate DateTime?`
- `unitCost Decimal @db.Decimal(10, 2)?`
- `reorderLevel Int?`

The frontend `LOW_STOCK_THRESHOLD` constant should become per-product once
`reorderLevel` exists.

## 5. Fix the `PaymentMethod` enum

**Problem.** The Prisma enum in `schema.prisma` is `E_Wallet` (mixed case) but
the natural conversion from the UI label "E-wallet" is `E_WALLET`. Every
E-wallet sale used to fail. The frontend now uses an explicit map, but the
enum is still inconsistent with `CASH` and `CARD`.

**Fix.** Rename the enum literal to `E_WALLET` in `schema.prisma` and update
the map in `cashierPOS.jsx` in the same commit. Migration is trivial (single
`ALTER TYPE`).

## 6. Z-Reading & daily ledger endpoints

**Problem.** July 31 explicitly asks for X Reports for shifts, Z Reports for
end-of-day, and daily ledger summaries. Only X-Reading exists.

**Fix.** `POST /api/reconciliation/z-reading` finalizes the day and marks
sales as reconciled. `GET /api/reconciliation/ledger?date=YYYY-MM-DD` returns
per-cashier totals. The Accounting screen already renders the daily ledger
table from `GET /api/reconciliation` — the Z endpoint is what makes it
authoritative.

## 7. Consignment Partner portal

**Problem.** July 10 names Consignment Partners as one of the five target
user groups, but no screen exists for them. The July 1 form describes them
being forced to phone the office to see whether their goods have sold.

**Fix.** New role `CONSIGNMENT` in the `Role` enum, new table linking a
Consignment Partner to a set of Products, and new read-only screens
`/consignment/dashboard` and `/consignment/statement`. Auto-email weekly
statements per the July 10 consultation.

## 8. Python demand-forecasting service

**Problem.** The forecast tab on the dashboard and the entire Demand screen
display placeholder data from `src/mocks/demandForecast.js`.

**Fix.** Stand up the Python service with at minimum:
- `GET /api/forecast/current` — current-period stats.
- `GET /api/forecast/future` — projected demand.
- `GET /api/forecast/product/:id` — per-item recommendation.

The frontend charts are already keyed on these shapes — swap the mock import
for a fetch and the screens light up.

## 9. Repo hygiene

- `backend/.env` is committed. `git ls-files` lists it; only `node_modules`
  is in `.gitignore`. Rotate the DATABASE_URL, untrack the file, expand the
  `.gitignore`.
- Root `package.json` still lists `mongoose` (project uses Prisma / pg).
- `backend/models/PendingOrders.js` is a 0-byte file. Delete or implement.
- `frontend/src/pages/CashierPOS` (case sensitive) was imported from a file
  actually named `cashierPOS.jsx`; Vite production builds and any Linux CI
  fail to resolve that. Fixed in this pass.
