import { useEffect, useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { apiGet } from '../../lib/api';
import { peso, amount, toNumber, formatDate, dateKey } from '../../lib/format';

const GREY_COLORS = [
  '#2C302E', '#434A47', '#59635F', '#707C77',
  '#87958F', '#9EAFA7', '#B5C8BF', '#626868',
  '#7A8181', '#939A9A', '#ACB3B3', '#C5CCCC',
];

/** Group transactions into daily buckets for the trailing 7 days. */
function buildDailyRevenue(transactions) {
  const buckets = new Map();
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    buckets.set(dateKey(d), { day: String(d.getDate()), revenue: 0 });
  }
  transactions.forEach((tx) => {
    const key = dateKey(tx.createdAt);
    const b = buckets.get(key);
    if (b) b.revenue += toNumber(tx.totalAmount);
  });
  return Array.from(buckets.values());
}

/** Monthly totals for the current year. */
function buildMonthlyRevenue(transactions) {
  const buckets = Array.from({ length: 12 }, (_, i) => ({
    month: String(i + 1),
    revenue: 0,
  }));
  const currentYear = new Date().getFullYear();
  transactions.forEach((tx) => {
    const d = new Date(tx.createdAt);
    if (d.getFullYear() !== currentYear) return;
    buckets[d.getMonth()].revenue += toNumber(tx.totalAmount);
  });
  return buckets;
}

/** Inventory balance by category, weighted by stock × price. */
function buildInventoryBalance(products) {
  const groups = new Map();
  products.forEach((p) => {
    const cat = p.category || 'Uncategorized';
    const value = toNumber(p.stock) * toNumber(p.price);
    groups.set(cat, (groups.get(cat) || 0) + value);
  });
  return Array.from(groups.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export default function AccountingSection() {
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [reconciliations, setReconciliations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    // `loading` starts true — do not re-set synchronously here.
    Promise.all([
      apiGet('/api/transactions'),
      apiGet('/api/products'),
      apiGet('/api/reconciliation').catch(() => []), // may 500 on empty DB
    ])
      .then(([tx, p, r]) => {
        if (!alive) return;
        setTransactions(Array.isArray(tx) ? tx : []);
        setProducts(Array.isArray(p) ? p : []);
        setReconciliations(Array.isArray(r) ? r : []);
        setError(null);
      })
      .catch((err) => alive && setError(err.message || 'Failed to load accounting data'))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const dailyRevenue = useMemo(() => buildDailyRevenue(transactions), [transactions]);
  const monthlyRevenue = useMemo(() => buildMonthlyRevenue(transactions), [transactions]);
  const inventoryBalance = useMemo(() => buildInventoryBalance(products), [products]);
  const inventoryTotal = useMemo(
    () => inventoryBalance.reduce((sum, entry) => sum + entry.value, 0),
    [inventoryBalance]
  );

  return (
    <div className="flex flex-col gap-4 flex-1 min-h-0">
      <h2 className="text-sm sm:text-base font-black text-black tracking-wider uppercase shrink-0">
        Accounting Section
      </h2>

      {error && (
        <div role="alert" className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 rounded-lg p-2">
          {error}
        </div>
      )}

      {/* Top row: daily + monthly revenue */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0">
        <ChartCard title="Daily Revenue (last 7 days)">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#374151' }} />
              <YAxis tick={{ fontSize: 10, fill: '#374151' }} />
              <Tooltip formatter={(v) => peso(v)} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#2D4A53"
                strokeWidth={2}
                dot={{ r: 3, fill: '#2D4A53' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={`Monthly Revenue (${new Date().getFullYear()})`}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#374151' }} />
              <YAxis tick={{ fontSize: 10, fill: '#374151' }} />
              <Tooltip formatter={(v) => peso(v)} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#2D4A53"
                strokeWidth={2}
                dot={{ r: 3, fill: '#2D4A53' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Middle row: inventory balance donut */}
      <div className="flex justify-center w-full shrink-0">
        <div className="bg-[#E4E4E4] rounded-2xl p-4 border border-gray-300/60 flex flex-col items-center w-full max-w-xl">
          <div className="bg-[#D8D8D8] text-gray-800 text-[10px] font-bold px-4 py-1 rounded-full border border-gray-400/40 uppercase mb-2">
            Inventory Balance (stock × price)
          </div>

          <div className="relative w-full h-[220px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={inventoryBalance}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={1}
                  dataKey="value"
                >
                  {inventoryBalance.map((entry, index) => (
                    <Cell key={entry.name} fill={GREY_COLORS[index % GREY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => peso(v)} />
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-lg font-black text-black">{peso(inventoryTotal)}</span>
              <span className="text-[10px] font-bold text-gray-700 uppercase">Total value</span>
            </div>
          </div>

          {inventoryBalance.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-2 text-[11px] text-gray-700 font-medium">
              {inventoryBalance.map((item, index) => (
                <div key={item.name} className="flex items-center gap-1">
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: GREY_COLORS[index % GREY_COLORS.length] }}
                    aria-hidden="true"
                  />
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom row: daily ledger summary from reconciliations */}
      <div className="bg-[#F5F5F5] rounded-2xl p-3 sm:p-4 border border-gray-200/80 shrink-0">
        <h3 className="text-xs sm:text-sm font-black text-black uppercase tracking-wide mb-2">
          Daily Ledger Summary
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-gray-800 border-b border-gray-400/40">
                <th className="pb-1.5 font-bold">Date</th>
                <th className="pb-1.5 font-bold">Report No</th>
                <th className="pb-1.5 font-bold">Cashier</th>
                <th className="pb-1.5 font-bold text-right">Gross</th>
                <th className="pb-1.5 font-bold text-right">Discount</th>
                <th className="pb-1.5 font-bold text-right">Net</th>
                <th className="pb-1.5 font-bold text-right">Short / Over</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300 font-medium text-gray-900">
              {loading && (
                <tr><td colSpan={7} className="py-3 text-center text-gray-700">Loading…</td></tr>
              )}
              {!loading && reconciliations.length === 0 && (
                <tr><td colSpan={7} className="py-3 text-center text-gray-700">No reconciliations submitted yet.</td></tr>
              )}
              {reconciliations.map((r) => {
                const so = toNumber(r.shortOver);
                const soClass = so < 0 ? 'text-red-700' : so > 0 ? 'text-emerald-800' : '';
                return (
                  <tr key={r.id} className="hover:bg-gray-200/40">
                    <td className="py-1.5">{formatDate(r.reconciliationDate || r.createdAt)}</td>
                    <td className="py-1.5 font-mono">{r.reportNo}</td>
                    <td className="py-1.5">{r.cashier?.username || `#${r.cashierId}`}</td>
                    <td className="py-1.5 text-right">{amount(r.grossSales)}</td>
                    <td className="py-1.5 text-right">{amount(r.totalDiscount)}</td>
                    <td className="py-1.5 text-right font-bold">{amount(r.netSales)}</td>
                    <td className={`py-1.5 text-right font-bold ${soClass}`}>{amount(so)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-[#E4E4E4] rounded-2xl p-3 border border-gray-300/60 flex flex-col items-center">
      <div className="bg-[#D8D8D8] text-gray-800 text-[10px] font-bold px-4 py-1 rounded-full border border-gray-400/40 uppercase mb-2">
        {title}
      </div>
      <div className="w-full h-[200px]">{children}</div>
    </div>
  );
}
