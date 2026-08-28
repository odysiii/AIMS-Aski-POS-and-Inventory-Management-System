import React, { useState } from 'react';
import { Home, Bell, Banknote, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import NotificationPanel from './NotificationPanel';

const dailySalesData = [
  { day: '1', sales: 2400 },
  { day: '2', sales: 800 },
  { day: '3', sales: 4200 },
  { day: '4', sales: 5600 },
  { day: '5', sales: 5200 },
  { day: '6', sales: 1800 },
  { day: '7', sales: 6400 },
  { day: '8', sales: 4600 },
  { day: '9', sales: 9600 },
  { day: '10', sales: 9100 },
  { day: '20', sales: 8700 },
  { day: '30', sales: 500 },
];

const demandForecastData = [
  { month: 'Jan', demand: 22 },
  { month: 'Feb', demand: 16 },
  { month: 'Mar', demand: 18 },
  { month: 'Apr', demand: 36 },
  { month: 'May', demand: 41 },
  { month: 'June', demand: 22 },
  { month: 'July', demand: 25 },
  { month: 'Aug', demand: 40 },
  { month: 'Sept', demand: 43 },
  { month: 'Oct', demand: 51 },
];

const recentTransactions = [
  { date: '02/12/2026', id: '200870027', amount: 'PHP 4,005.00', status: 'Complete' },
  { date: '02/12/2026', id: '200870026', amount: 'PHP 3,909.00', status: 'Complete' },
  { date: '02/12/2026', id: '200870025', amount: 'PHP 8,334.00', status: 'Complete' },
  { date: '02/12/2026', id: '200870024', amount: 'PHP 6,567.00', status: 'Complete' },
  { date: '02/12/2026', id: '200870023', amount: 'PHP 1,665.00', status: 'Void' },
];

const expiryWatchlist = [
  { product: 'Category 1 - Product 1', days: 10 },
  { product: 'Category 1 - Product 2', days: 14 },
  { product: 'Category 1 - Product 3', days: 20 },
  { product: 'Category 2 - Product 1', days: 23 },
  { product: 'Category 4 - Product 1', days: 25 },
  { product: 'Category 6 - Product 1', days: 27 },
  { product: 'Category 8 - Product 1', days: 30 },
  { product: 'Category 1 - Product 5', days: 30 },
  { product: 'Category 1 - Product 3', days: 30 },
];

export default function Dashboard() {
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  return (
    <>
      {/* ===== HEADER ====== */}
      <header className="relative z-30 flex items-center justify-between bg-gradient-to-r from-white via-white/90 to-blue-200/60 backdrop-blur-xl border border-white/80 rounded-3xl px-8 py-4 shadow-xl shadow-blue-500/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30">
            <Home className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">AMPC</p>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">DASHBOARD</h2>
          </div>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-3 rounded-2xl bg-white border border-slate-200/60 text-slate-700 hover:bg-slate-50 transition shadow-sm"
          >
            <Bell className="w-5 h-5 text-slate-700" />
            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-white animate-pulse" />
          </button>

          <NotificationPanel 
            isOpen={isNotifOpen} 
            onClose={() => setIsNotifOpen(false)} 
          />
        </div>
      </header>

      {/* MAIN GRID SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* TOP METRICS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/80 via-blue-100/30 to-indigo-300/40 backdrop-blur-xl border border-white/80 p-5 shadow-xl shadow-blue-500/10 hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300">
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-sky-300/40 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
              <div className="flex items-center justify-between mb-3 relative z-10">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Total Revenue Today</span>
                <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 text-white shadow-md shadow-blue-500/30">
                  <Banknote className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight relative z-10">PHP 30,550</h3>
            </div>

            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/80 via-blue-100/30 to-indigo-300/40 backdrop-blur-xl border border-white/80 p-5 shadow-xl shadow-blue-500/10 hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300">
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-rose-300/30 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
              <div className="flex items-center justify-between mb-3 relative z-10">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Low Stocks Alert</span>
                <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-rose-600 text-white shadow-md shadow-rose-500/30">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-rose-700 tracking-tight relative z-10">5 Items</h3>
            </div>
          </div>

          {/* DAILY SALES TREND CHART */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-white via-white/90 to-blue-200/60 backdrop-blur-xl border border-white/80 p-6 shadow-xl shadow-blue-500/10 hover:shadow-2xl hover:shadow-blue-500/15 transition-all duration-300 flex-1 flex flex-col justify-between min-h-[220px]">
            <div className="absolute top-0 left-0 w-64 h-64 bg-sky-300/40 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Daily Sales Trend</h3>
                <p className="text-xs text-slate-500">Day-by-day overall revenue performance</p>
              </div>
            </div>

            <div className="h-56 w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailySalesData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff80" vertical={false} />
                  <XAxis dataKey="day" stroke="#475569" fontSize={11} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={11} tickLine={false} domain={[0, 10000]} ticks={[0, 2000, 4000, 6000, 8000, 10000]} tickFormatter={(val) => `₱${val}`} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(12px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#salesGrad)" dot={{ r: 4, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* RECENT TRANSACTIONS TABLE */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-white via-white/90 to-blue-200/60 backdrop-blur-xl border border-white/80 p-6 shadow-xl shadow-blue-500/10 hover:shadow-2xl transition-all duration-300 flex flex-col">
            <div className="mb-3 relative z-10">
              <h3 className="text-lg font-bold text-slate-800">Recent Transactions</h3>
              <p className="text-xs text-slate-500">Latest completed and voided point-of-sale entries</p>
            </div>

            <div className="overflow-x-auto relative z-10">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-200/60 uppercase text-[10px] tracking-wider font-bold">
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Transaction ID</th>
                    <th className="pb-2 text-center">Amount</th>
                    <th className="pb-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/40 font-medium text-slate-700">
                  {recentTransactions.map((tx, idx) => (
                    <tr key={idx} className="hover:bg-white/50 transition-colors">
                      <td className="py-2.5 whitespace-nowrap">{tx.date}</td>
                      <td className="py-2.5 font-mono text-slate-600 whitespace-nowrap">{tx.id}</td>
                      <td className="py-2.5 text-center font-bold text-slate-800 whitespace-nowrap">{tx.amount}</td>
                      <td className="py-2.5 text-right whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold ${tx.status === 'Complete' ? 'bg-emerald-500/15 text-emerald-700 border border-emerald-300/50' : 'bg-rose-500/15 text-rose-700 border border-rose-300/50'}`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* AI DEMAND FORECAST CHART */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 backdrop-blur-xl border border-slate-700/60 p-6 shadow-2xl shadow-slate-900/40 transition-all duration-300 flex-1 flex flex-col justify-between min-h-[220px]">
            <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-600/15 rounded-full blur-2xl pointer-events-none" />

            <div className="mb-3 relative z-10">
              <h3 className="text-lg font-bold text-white tracking-wide">AI Demand Forecast</h3>
              <p className="text-xs text-slate-400">Predicted monthly unit requirements</p>
            </div>

            <div className="h-52 w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={demandForecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="navyDemandGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(12px)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', color: '#f8fafc' }} />
                  <Area type="monotone" dataKey="demand" stroke="#38bdf8" strokeWidth={2.5} fillOpacity={1} fill="url(#navyDemandGrad)" dot={{ r: 3.5, fill: '#38bdf8', stroke: '#0f172a', strokeWidth: 1.5 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* EXPIRY WATCHLIST */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 backdrop-blur-xl border border-slate-700/60 p-6 shadow-2xl shadow-slate-900/40 transition-all duration-300 flex flex-col flex-1 min-h-[220px]">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="mb-3 relative z-10">
              <h3 className="text-lg font-bold text-white tracking-wide">Expiry Watchlist</h3>
              <p className="text-xs text-slate-400">Stock reaching shelf-life threshold soon</p>
            </div>

            <div className="overflow-y-auto flex-1 pr-1 max-h-[200px] relative z-10 navy-scrollbar">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-700/60 uppercase text-[10px] tracking-wider font-bold sticky top-0 backdrop-blur-md">
                    <th className="pb-2">Product</th>
                    <th className="pb-2 text-right">Days left</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-medium text-slate-200">
                  {expiryWatchlist.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-2.5 truncate max-w-[140px] sm:max-w-none text-slate-300">{item.product}</td>
                      <td className="py-2.5 text-right">
                        <span className={`inline-flex items-center justify-center font-bold px-2 py-0.5 rounded-lg text-xs ${item.days <= 14 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'}`}>
                          {item.days} days
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}