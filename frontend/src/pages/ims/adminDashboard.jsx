import { useEffect, useMemo, useState } from 'react';
import { Banknote, AlertTriangle } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { apiGet } from '../../lib/api';
import { pesoWhole, peso, formatDate, dateKey, toNumber, isToday } from '../../lib/format';
import { LOW_STOCK_THRESHOLD, RECENT_TRANSACTION_LIMIT } from '../../config';

// Expiry data cannot be derived — Product has no expiryDate column yet.
// Kept as sample so the tile is not empty; labelled in the UI.
const expiryWatchlistSample = [
  { product: 'Category 1 - Product 1', days: 10 },
  { product: 'Category 1 - Product 2', days: 14 },
  { product: 'Category 1 - Product 3', days: 20 },
  { product: 'Category 2 - Product 1', days: 23 },
  { product: 'Category 4 - Product 1', days: 25 },
];

// Demand forecast series — placeholder until the Python service exists.
const demandForecastSample = [
  { month: 'Jan', demand: 22 }, { month: 'Feb', demand: 16 },
  { month: 'Mar', demand: 18 }, { month: 'Apr', demand: 36 },
  { month: 'May', demand: 41 }, { month: 'June', demand: 22 },
  { month: 'July', demand: 25 }, { month: 'Aug', demand: 40 },
  { month: 'Sept', demand: 43 }, { month: 'Oct', demand: 51 },
];

function buildDailySeries(transactions) {
  // Trailing 30 days, oldest first, filled with zeros for gaps.
  const buckets = new Map();
  for (let i = 29; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    buckets.set(dateKey(d), { day: String(d.getDate()), sales: 0 });
  }
  transactions.forEach((tx) => {
    const key = dateKey(tx.createdAt);
    const entry = buckets.get(key);
    if (entry) entry.sales += toNumber(tx.totalAmount);
  });
  return Array.from(buckets.values());
}

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    // `loading` initializes to true — no need to set it again here, which lets
    // us keep the effect body free of synchronous setState calls.
    Promise.all([apiGet('/api/products'), apiGet('/api/transactions')])
      .then(([p, t]) => {
        if (!alive) return;
        setProducts(Array.isArray(p) ? p : []);
        setTransactions(Array.isArray(t) ? t : []);
        setError(null);
      })
      .catch((err) => alive && setError(err.message || 'Failed to load dashboard data'))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const todayRevenue = useMemo(
    () => transactions.filter((tx) => isToday(tx.createdAt))
      .reduce((sum, tx) => sum + toNumber(tx.totalAmount), 0),
    [transactions]
  );

  const lowStockCount = useMemo(
    () => products.filter((p) => toNumber(p.stock) <= LOW_STOCK_THRESHOLD).length,
    [products]
  );

  const dailySalesData = useMemo(() => buildDailySeries(transactions), [transactions]);

  const recentTransactions = useMemo(
    () => transactions.slice(0, RECENT_TRANSACTION_LIMIT),
    [transactions]
  );

  return (
    <div className="flex flex-col gap-3 flex-1 min-h-0">
      <h2 className="text-sm sm:text-base font-black text-black tracking-wider uppercase shrink-0">
        Dashboard
      </h2>

      {error && (
        <div role="alert" className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 rounded-lg p-2">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 min-h-0">
        {/* Left column */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          {/* KPI tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-[#D9D9D9] p-3 sm:p-4 rounded-xl flex items-start justify-between shadow-xs">
              <div>
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide mb-1 sm:mb-2">
                  Total Revenue Today
                </h3>
                <p className="text-xl sm:text-2xl md:text-3xl font-black text-black tracking-tight">
                  {loading ? '—' : pesoWhole(todayRevenue)}
                </p>
              </div>
              <div className="p-2 bg-gray-400/30 rounded-lg shrink-0">
                <Banknote className="w-5 h-5 text-gray-700" aria-hidden="true" />
              </div>
            </div>

            <div className="bg-[#D9D9D9] p-3 sm:p-4 rounded-xl flex items-start justify-between shadow-xs">
              <div>
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide mb-1 sm:mb-2">
                  Low Stock Alert
                </h3>
                <p className="text-xl sm:text-2xl md:text-3xl font-black text-black tracking-tight">
                  {loading ? '—' : `${lowStockCount} ${lowStockCount === 1 ? 'ITEM' : 'ITEMS'}`}
                </p>
                <p className="text-[10px] text-gray-700 mt-1">
                  Threshold: {LOW_STOCK_THRESHOLD}
                </p>
              </div>
              <div className="p-2 bg-gray-400/30 rounded-lg shrink-0">
                <AlertTriangle className="w-5 h-5 text-gray-700" aria-hidden="true" />
              </div>
            </div>
          </div>

          {/* Daily sales trend */}
          <div className="bg-[#D9D9D9] p-3 rounded-xl flex-1 flex flex-col min-h-[220px]">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide mb-2">
              Daily Sales Trend (last 30 days)
            </h3>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailySalesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4B5563" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#4B5563" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#C2C2C2" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#374151' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#374151' }} />
                  <Tooltip formatter={(v) => peso(v)} />
                  <Area type="monotone" dataKey="sales" stroke="#374151" strokeWidth={2} fillOpacity={1} fill="url(#salesGrad)" dot={{ r: 2, fill: '#374151' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent transactions */}
          <div className="bg-[#D9D9D9] p-3 rounded-xl flex flex-col">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide mb-2">
              Recent Transactions
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-gray-700 border-b border-gray-400/40">
                    <th className="pb-1.5 font-bold">Date</th>
                    <th className="pb-1.5 font-bold">Transaction No</th>
                    <th className="pb-1.5 font-bold text-center">Amount</th>
                    <th className="pb-1.5 font-bold text-right">Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-400/20 font-medium text-gray-900">
                  {loading && (
                    <tr><td colSpan={4} className="py-3 text-center text-gray-600">Loading…</td></tr>
                  )}
                  {!loading && recentTransactions.length === 0 && (
                    <tr><td colSpan={4} className="py-3 text-center text-gray-600">No transactions yet.</td></tr>
                  )}
                  {recentTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-400/10 transition-colors">
                      <td className="py-1.5 whitespace-nowrap">{formatDate(tx.createdAt)}</td>
                      <td className="py-1.5 font-mono whitespace-nowrap">{tx.transactionNo || `#${tx.id}`}</td>
                      <td className="py-1.5 text-center font-bold whitespace-nowrap">{peso(tx.totalAmount)}</td>
                      <td className="py-1.5 text-right font-bold whitespace-nowrap">{tx.paymentMethod}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          {/* AI demand forecast — sample */}
          <div className="bg-[#D9D9D9] p-3 rounded-xl flex-1 flex flex-col min-h-[220px]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                AI Demand Forecast
              </h3>
              <span
                className="text-[9px] font-bold uppercase tracking-wide text-amber-800 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded"
                title="Model output not yet wired — see BACKEND-HANDOFF.md"
              >
                Sample data
              </span>
            </div>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={demandForecastSample} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="demandGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6B7280" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#6B7280" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#C2C2C2" />
                  <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#374151' }} />
                  <YAxis tick={{ fontSize: 9, fill: '#374151' }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="demand" stroke="#4B5563" strokeWidth={2} fillOpacity={1} fill="url(#demandGrad)" dot={{ r: 3, fill: '#4B5563' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Expiry watchlist — sample */}
          <div className="bg-[#D9D9D9] p-3 rounded-xl flex flex-col flex-1 min-h-[220px]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                Expiry Watchlist
              </h3>
              <span
                className="text-[9px] font-bold uppercase tracking-wide text-amber-800 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded"
                title="Product has no expiryDate column — see BACKEND-HANDOFF.md"
              >
                Sample data
              </span>
            </div>
            <div className="overflow-y-auto flex-1 pr-1 max-h-[220px]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-gray-700 border-b border-gray-400/40 sticky top-0 bg-[#D9D9D9]">
                    <th className="pb-1 font-bold">Product</th>
                    <th className="pb-1 font-bold text-right">Days until Expiry</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-400/20 font-medium text-gray-900">
                  {expiryWatchlistSample.map((item) => (
                    <tr key={item.product} className="hover:bg-gray-400/10 transition-colors">
                      <td className="py-1 truncate max-w-[120px] sm:max-w-none">{item.product}</td>
                      <td className="py-1 text-right font-bold">{item.days}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
