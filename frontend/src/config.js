/**
 * App-wide constants. Deliberately small — real preferences belong on the
 * Settings screen once it exists.
 */

/** Reorder threshold for the dashboard "Low Stocks Alert" tile.
 *  Product has no per-item reorderLevel column yet — see BACKEND-HANDOFF.md. */
export const LOW_STOCK_THRESHOLD = 10;

/** How many recent transactions to show on the admin dashboard. */
export const RECENT_TRANSACTION_LIMIT = 5;

/** How often the POS re-polls product stock to mitigate stale-cache oversells. */
export const POS_STOCK_POLL_MS = 20_000;
