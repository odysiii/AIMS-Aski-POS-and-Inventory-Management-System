import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  TrendingUp, 
  AlertTriangle, 
  PackageCheck, 
  DollarSign, 
  RefreshCw,
  Calendar
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

export default function Demand() {
  const [demandMode, setDemandMode] = useState('current'); // 'current' (30 days) | 'future' (60 days)
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchForecast = async () => {
    setLoading(true);
    setError(null);
    try {
      const days = demandMode === 'future' ? 60 : 30;
      // Fetching predictions from Express backend endpoint
      const res = await axios.get(`http://localhost:5000/api/forecast?days=${days}`);
      
      if (res.data.success) {
        setForecast(res.data.data);
      } else {
        setError('Failed to load forecast data from server');
      }
    } catch (err) {
      console.error('Error fetching AI predictions:', err);
      setError('Cannot connect to AI service. Ensure backend and FastAPI are running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, [demandMode]);

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-4 font-sans text-slate-500">
        <RefreshCw className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="font-semibold">Generating AI Demand & Revenue Predictions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-4 text-center font-sans">
        <AlertTriangle className="h-10 w-10 text-rose-500" />
        <p className="font-semibold text-slate-700">{error}</p>
        <button
          onClick={fetchForecast}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const { kpis, revenueTrajectory, skuDemandList } = forecast;

  return (
    <div className="space-y-6 p-6 font-sans">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Demand & Sales Forecasting</h1>
          <p className="text-sm text-slate-500">
            Machine-learning demand estimates, sales velocity, and reorder triggers.
          </p>
        </div>

        {/* Mode Toggle Button */}
        <div className="flex items-center space-x-2 rounded-lg bg-slate-100 p-1 border">
          <button
            onClick={() => setDemandMode('current')}
            className={`flex items-center space-x-1 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
              demandMode === 'current'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>30-Day Outlook</span>
          </button>
          <button
            onClick={() => setDemandMode('future')}
            className={`flex items-center space-x-1 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
              demandMode === 'future'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>60-Day Forecast</span>
          </button>
        </div>
      </div>

      {/* 2. SUMMARY KPI CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Gross Projected Revenue */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Projected Gross
            </span>
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-800">
              ₱{kpis.projectedGross?.toLocaleString() || '0'}
            </h3>
            <p className="mt-1 text-xs text-emerald-600 font-semibold">{kpis.grossGrowth} target trajectory</p>
          </div>
        </div>

        {/* Net Projected Revenue */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Projected Net
            </span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-800">
              ₱{kpis.projectedNet?.toLocaleString() || '0'}
            </h3>
            <p className="mt-1 text-xs text-slate-400">After estimated discounts</p>
          </div>
        </div>

        {/* Discount Baseline */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Est. Discounts
            </span>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <PackageCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-800">
              ₱{kpis.projectedDiscounts?.toLocaleString() || '0'}
            </h3>
            <p className="mt-1 text-xs text-amber-600 font-medium">~4.5% promotional margin</p>
          </div>
        </div>

        {/* Stock Alerts */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Stock Alerts
            </span>
            <div className="rounded-lg bg-rose-50 p-2 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-800">
              {kpis.highRiskSKUs} Items
            </h3>
            <p className="mt-1 text-xs text-rose-600 font-semibold">Requires reorder or action</p>
          </div>
        </div>
      </div>

      {/* 3. REVENUE TRAJECTORY GRAPH */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-800">Sales & Revenue Trajectory</h2>
        <p className="mb-4 text-xs text-slate-500">Historical actual daily total vs AI projected trajectory</p>
        
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueTrajectory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `₱${val}`} />
              <Tooltip formatter={(value) => [`₱${value}`, 'Revenue']} />
              <Area type="monotone" dataKey="actual" stroke="#4f46e5" fillOpacity={1} fill="url(#colorActual)" name="Actual Sales" />
              <Area type="monotone" dataKey="forecast" stroke="#10b981" strokeDasharray="5 5" fillOpacity={1} fill="url(#colorForecast)" name="AI Forecast" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. SKU DEMAND & REORDER TABLE */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-800">SKU Demand & Reorder Logic</h2>
            <p className="text-xs text-slate-500">Item velocity, predicted 7-day demand, and suggested purchase order quantities</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4 text-center">Current Stock</th>
                <th className="py-3 px-4 text-center">Daily Demand</th>
                <th className="py-3 px-4 text-center">7-Day Target</th>
                <th className="py-3 px-4 text-center">Suggested Reorder</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {skuDemandList.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-mono text-xs font-semibold text-slate-700">{item.sku}</td>
                  <td className="py-3 px-4 font-medium text-slate-800">{item.name}</td>
                  <td className="py-3 px-4 text-center">{item.stock}</td>
                  <td className="py-3 px-4 text-center">{item.dailyDemand} / day</td>
                  <td className="py-3 px-4 text-center">{item.forecast7Day}</td>
                  <td className="py-3 px-4 text-center font-bold text-indigo-600">
                    {item.reorderQty > 0 ? `+${item.reorderQty}` : '0'}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        item.status === 'REORDER NOW'
                          ? 'bg-rose-100 text-rose-700'
                          : item.status === 'EXPIRY RISK'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}