/**
 * Shared formatting helpers.
 *
 * Money used to be formatted three different ways across the app
 * (`toFixed(2)`, `toLocaleString('en-US', …)`, and raw interpolation), so the
 * same figure could render as "1234.5", "1,234.50" or "PHP 1234.50" depending
 * on which screen you were looking at.
 */

/** Prisma returns Decimal columns as strings; coerce safely. */
export const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

/** "1,234.50" — no currency prefix, for table cells. */
export const amount = (value) =>
  toNumber(value).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/** "PHP 1,234.50" — for totals and headline figures. */
export const peso = (value) => `PHP ${amount(value)}`;

/** "PHP 30,550" — compact, for dashboard KPI tiles. */
export const pesoWhole = (value) =>
  `PHP ${Math.round(toNumber(value)).toLocaleString('en-PH')}`;

/** "08/14/2026" */
export const formatDate = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-PH', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
};

/** "2:45 PM" */
export const formatTime = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/** Local YYYY-MM-DD. Avoids toISOString(), which shifts to UTC and can report
 *  "yesterday" for evening transactions in PH time (UTC+8). */
export const dateKey = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
};

export const isToday = (value) => dateKey(value) === dateKey(new Date());
