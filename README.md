# AIMS POS & Inventory System

An Inventory Management System with AI-powered Demand Forecasting through POS,
built for ASKI Multipurpose Cooperative (AMPC).

**Stack:** PostgreSQL, Express, React, Node.js (PERN) + Python for the forecasting service.

---

## Prerequisites

Install these before you start:

- Node.js v18 or higher
- Git
- PostgreSQL installed and running locally

---

## Getting Started

### 1. Clone the Repository

```bash
git clone <YOUR-GITHUB-REPO-URL>
cd AIMS-Aski-POS-and-Inventory-Management-System
```

### 2. Set Up Your Local PostgreSQL Database

Make sure your PostgreSQL service is running, then create the database:

- **Database Name:** `aims-pos-ims-db`
- **Default DB User:** `postgres`
- **Default DB Password:** `admin123`

> If your local PostgreSQL password is different from `admin123`, update `backend/.env`
> with your actual `DATABASE_URL`.

Create the database via `psql`:

```sql
CREATE DATABASE "aims-pos-ims-db";
```

### 3. Backend Setup & Startup

```bash
cd backend
npm install
npx prisma db push        # generates client + creates tables
node index.js             # starts on http://localhost:5000
```

### 4. Frontend Setup & Startup

Open a new terminal:

```bash
cd frontend
cp .env.example .env      # first time only
npm install
npm run dev               # starts on http://localhost:5173
```

The frontend runs on port **5173** with `strictPort: true` — if that port is taken,
free it before running (see Troubleshooting below).

---

## Login Credentials (Dev Mode)

While `VITE_AUTH_MODE=dev` in `frontend/.env` (the default), you can log in with:

| Role       | Username     | Password         |
|------------|--------------|------------------|
| Admin      | `admin`      | `admin123`       |
| Supervisor | `supervisor` | `supervisor123`  |
| Cashier    | `cashier`    | `cashier123`     |
| Accounting | `accounting` | `accounting123`  |
| Inventory  | `inventory`  | `inventory123`   |

**Supervisor PIN** for POS discount authorization: `super123`

Each role lands on a different screen after login (cashiers on the POS, admin on
the dashboard, accounting on the analytics view). See `frontend/src/auth/devUsers.js`.

> **Dev mode is not for production.** Once the backend implements
> `POST /api/auth/login`, set `VITE_AUTH_MODE=api` in `.env` — no code changes needed.

---

## Application Endpoints

Once both servers are running:

- **Backend API:** http://localhost:5000
- **Frontend App:** http://localhost:5173

---

## Project Structure

```
frontend/
  src/
    auth/           AuthContext, role guards, dev user table
    components/     AppLayout, Sidebar, Modal, Toast, ErrorBoundary
    lib/            api.js (fetch wrapper), format.js (money/date helpers)
    pages/
      auth/login.jsx
      cashierPOS.jsx
      ims/          adminDashboard, inventoryList, demand, accounting
    mocks/          Placeholder data for forecast (until Python service exists)
backend/
  index.js          Express routes
  models/           Prisma model wrappers
  prisma/           schema.prisma + migrations
BACKEND-HANDOFF.md  What the backend still needs — read this before wiring more
```

---

## Troubleshooting

**"Port 5173 is already in use"** — a previous `npm run dev` is still running.
Find the process ID and kill it:

```powershell
Get-NetTCPConnection -LocalPort 5173 | Select-Object OwningProcess
taskkill /PID <that-id> /F
```

**"Cannot reach the server at http://localhost:5000"** on the dashboard — the
frontend is running but the backend isn't. Start it in a second terminal per
step 3. Login and navigation still work; only screens fetching live data show
the error banner.

**Login rejects everything** — check `frontend/.env` exists and contains
`VITE_AUTH_MODE=dev`. Without it the frontend tries to POST to the real API
endpoint, which does not exist yet.

**"Failed to fetch products"** on the POS — the backend is running but the
database isn't seeded. Run `node seeder.js` inside `backend/`.

---

## What Changed in This Frontend Pass — In Plain Language

The frontend was a pretty set of screens that couldn't really do anything yet:
the sidebar buttons didn't work, login accepted any password and let you into
everything, most screens showed made-up numbers instead of real ones, and it
wouldn't even start on a fresh computer. Here is what got fixed, without the
jargon.

### It actually runs now

Before, if you cloned the repo on a new machine and typed `npm install`, the
app would break because a library it needed (the one that draws all the small
icons) was missing from the shopping list. Also one file was named
`cashierPOS.jsx` but the code was looking for `CashierPOS.jsx` — this happens
to work on Windows but breaks the moment you deploy it anywhere else. Both
fixed.

### The sidebar buttons work

Before, the buttons on the left side (Home, Inventory, Forecast, Analytics)
were just pretty pictures. You couldn't actually click them to go anywhere —
you had to type the URL by hand. Now they're real links, they highlight the
page you're on, and there's a working Logout button.

There was also a hidden problem: the same sidebar was copy-pasted into four
different files. It had already started drifting apart — one page was missing
the Inventory button, another had a duplicate icon. It's now one sidebar,
shared by every page. Fix it once, fix it everywhere.

### Login is real now

**Before**, no matter what you typed into the login box — even nothing — it
took you straight to the admin dashboard. And anyone could paste
`/pos` or `/accounting` into their address bar and just walk in, no login
needed. This directly violates a client requirement written into the July 10
consultation form ("secure authentication and role-based access control").

**Now**, login actually checks a real list of accounts. Every role sees a
different set of screens:

- **Cashiers** only see the POS. They can't wander into accounting or admin.
- **Admins and supervisors** see everything.
- **Accounting** can see the money screens but nothing else.
- **Inventory** can see the stock screens but nothing else.

If a cashier tries to sneak into the accounting page by typing the URL, they
get a friendly "Access restricted" message instead of the page. Log out and the
system forgets you — no walking-away-from-the-terminal risk.

Once the backend team builds the real login endpoint, we flip one setting in a
config file and it uses the real user database instead of the test accounts —
no changes to the frontend code.

### The dashboard shows real numbers

**Before**, the admin dashboard was pure decoration. "Total Revenue Today: PHP
30,550" was literally typed into the code — that number would never change no
matter what happened in the store. Same with "Low Stocks Alert: 5 ITEMS" and
the recent-transactions list.

**Now**, all of it is pulled from the actual database:

- **Total Revenue Today** — adds up every real transaction from today.
- **Low Stock Alert** — counts products below 10 units.
- **Daily Sales Trend** — the last 30 days of real sales, plotted.
- **Recent Transactions** — the actual last 5 sales, with real IDs.

If the numbers don't match reality, it's because the database says so, not
because someone forgot to update a hardcoded string.

The AI Demand Forecast and Expiry Watchlist tiles are still on made-up numbers
— the AI service that produces them doesn't exist yet, and the database
doesn't yet track expiry dates. These tiles now have a small "Sample data"
badge so nobody demos them thinking they're real.

### The Inventory screen is live too

Before, the product list was three fake rows that never changed no matter what
you did. Search and filters ran against those three fake rows. Now the whole
table is live from the database. Search actually searches. Filters actually
filter. The category dropdown shows the real categories you have, not made-up
ones.

The "Add Product" button is wired up correctly but shows a friendly warning
that the backend needs one more piece before it can save — the backend team
hasn't built that endpoint yet. When they do, one line change and it works.

### The Accounting screen shows the real money

Same story: the pretty charts now show real data. Daily Revenue is the last 7
days of actual sales. Monthly Revenue is this year's actual sales by month.
The pie chart at the bottom shows what your inventory is really worth (stock
count × price, grouped by category), with the true total in the middle instead
of a made-up "5668". There's also a new "Daily Ledger Summary" table at the
bottom pulling every X-Reading a cashier has ever submitted.

### The POS (cashier register) had real bugs — all fixed

This is the only screen that was already talking to the database, but it had a
list of problems that would have caused real losses if you ran the store this
way:

**E-wallet payments always failed.** The backend expected the word
`E_Wallet` (mixed capitals) but the frontend sent `E_WALLET` (all capitals).
Every attempt to pay by e-wallet crashed. E-wallet is the cooperative's own
ACash system, so this mattered a lot. Fixed.

**Every sale claimed the same cashier made it.** No matter who was logged in,
the backend was told the sale was made by cashier #1, and the receipt always
printed "RACHELLE". The July 1 consultation form specifically calls out the
missing audit trail — a system that stamps every sale with the same person's
name doesn't help you audit anything. Now every sale carries the real logged-in
cashier's ID and name.

**The supervisor password was written in the login screen.** Literally. The
placeholder text said "Enter Password (super123)" — every cashier could see
the supervisor's discount password. Removed. And the password check now goes
through the auth system instead of being hardcoded into the page's JavaScript.

**You could type a 500% discount.** The system had a min/max attribute on the
input box but didn't enforce it in the code, so a mistake or malicious cashier
could enter any number. Now capped between 0 and 100.

**The End-of-Day totals were wrong.** The X-Reading report showed the current
cart's discount as the whole day's discount, so if the last customer got a
₱10 discount, the entire day's report claimed only ₱10 in discounts total.
Fixed — pulls the real day totals from the database now.

**Four of the peso denominations were missing.** The cash count screen let you
count 10 different bills and coins, but the export template expected 14 — the
₱0.50, ₱0.10, ₱0.05 and ₱0.01 coins always exported as zero. All 14 now
have inputs.

**Held sales disappeared if you refreshed the browser.** A cashier who parked
a customer's order to help another customer would lose the parked order the
moment they refreshed or accidentally closed the tab. Now saved to the
browser's session storage, so they survive refresh.

**Nothing stopped a cashier from selling stock that wasn't there.** The stock
check ran against the last-loaded product list, so if the stock changed since
the page loaded (another cashier sold the last one), a customer could still
add it to their cart. The real fix has to happen on the backend, but in the
meantime the POS now refreshes stock every 20 seconds and re-checks right
before you press Confirm — a warning fires if stock has changed since you
added the item.

**Cashiers now have a barcode scanner input and a "change due" calculator.**
The backend already had a barcode lookup endpoint that nobody was using.

### It's more usable for real people

- **Text is bigger.** Almost everything was 10-pixel text, which is tiny on a
  cashier terminal. Everything's been bumped up to a size a real person can
  read.
- **Better contrast.** Some of the grey-on-grey text failed accessibility
  standards. Fixed — no layout change, just darker greys where needed.
- **You can copy text now.** Every page had text-selection disabled, so you
  couldn't copy a transaction ID even if you wanted to. Removed.
- **Keyboard works.** You can now Tab through the product tiles at the POS
  and press Enter to add one. Modals close with Escape. Screen readers read
  out button names correctly.
- **No more `alert()` popups.** Those blocking browser popups (the ones you
  have to click OK on) are replaced with softer toast notifications that fade
  after a few seconds.
- **Errors don't white-screen the app.** If one screen crashes, you see a
  friendly error box with a "Try again" button instead of a blank browser.

### Behind the scenes: cleaner code

A lot of the work was cleanup that doesn't show up on the screen but makes the
next developer's life much easier:

- One place that knows how to talk to the backend (`lib/api.js`), instead of
  five different files each doing it their own way.
- One place that formats money and dates (`lib/format.js`), so PHP 1,234.50
  looks the same on every screen instead of three different ways.
- Server address is now configurable via `.env` file instead of typed into the
  code — matters when you deploy to a real branch instead of just localhost.

### What the backend still needs

I wrote a separate document, `BACKEND-HANDOFF.md` in the repo root, listing
everything I couldn't fix because it needed changes to the backend or the
database structure. It's ordered by how much it matters. The top two are:

1. **Server-side check that stops selling stock you don't have.** The frontend
   mitigations help but only the backend can make this actually safe.
2. **A real login endpoint.** The frontend is ready for it — the backend
   just needs to build it.

Read that file before you commission the next round of work; it saves everyone
a meeting.
