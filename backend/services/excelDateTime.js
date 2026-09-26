// "25/09/2026 02:15 PM" in the store's time zone, for the CREATED AT line on the PO/RR/PR exports —
// the server's own clock zone may differ from the store's.
const TIME_ZONE = process.env.STORE_TIMEZONE || process.env.TZ || 'Asia/Manila';

const formatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: TIME_ZONE,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
});

function fmtDateTime(value) {
  if (!value) return '-';
  const parts = Object.fromEntries(formatter.formatToParts(new Date(value)).map((p) => [p.type, p.value]));
  return `${parts.day}/${parts.month}/${parts.year} ${parts.hour}:${parts.minute} ${parts.dayPeriod.toUpperCase()}`;
}

module.exports = { fmtDateTime };
