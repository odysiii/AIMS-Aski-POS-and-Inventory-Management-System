import React, { useState } from 'react';
import { 
  Home, 
  Package,  
  Bell, 
  TrendingUp, 
  Zap,
  BrainCircuit,
  BarChart3
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import NotificationPanel from './NotificationPanel';

// --- DATA DEFINITIONS ---

// 1. Current Tab Data
const currentData = {
  transactionHours: [
    { hour: '8', dark: 10, light: 5 },
    { hour: '9', dark: 30, light: 10 },
    { hour: '10', dark: 33, light: 22 },
    { hour: '11', dark: 38, light: 15 },
    { hour: '12', dark: 45, light: 33 },
    { hour: '1', dark: 50, light: 18 },
    { hour: '2', dark: 53, light: 23 },
    { hour: '3', dark: 60, light: 31 },
    { hour: '4', dark: 63, light: 16 },
    { hour: '5', dark: 70, light: 16 },
    { hour: '6', dark: 62, light: 17 },
  ],
  revenueTrend: [
    { name: 'P1', line1: 85, line2: 55, line3: 50 },
    { name: 'P2', line1: 72, line2: 23, line3: 70 },
    { name: 'P3', line1: 67, line2: 60, line3: 65 },
    { name: 'P4', line1: 40, line2: 95, line3: 92 },
    { name: 'P5', line1: 60, line2: 32, line3: 88 },
    { name: 'P6', line1: 35, line2: 55, line3: 33 },
    { name: 'P7', line1: 68, line2: 83, line3: 25 },
    { name: 'P8', line1: 75, line2: 18, line3: 95 },
    { name: 'P9', line1: 22, line2: 25, line3: 15 },
    { name: 'P10', line1: 85, line2: 50, line3: 78 },
    { name: 'P11', line1: 20, line2: 40, line3: 96 },
    { name: 'P12', line1: 78, line2: 76, line3: 45 },
  ],
  categorySales: [
    { category: 'C1', sales: 430 },
    { category: 'C2', sales: 800 },
    { category: 'C3', sales: 480 },
    { category: 'C4', sales: 580 },
    { category: 'C5', sales: 390 },
  ],
  topSpecificItems: [
    { category: 'C1', seg1: 800, seg2: 700, seg3: 400 },
    { category: 'C2', seg1: 520, seg2: 780, seg3: 440 },
    { category: 'C3', seg1: 600, seg2: 770, seg3: 500 },
    { category: 'C4', seg1: 620, seg2: 640, seg3: 390 },
    { category: 'C5', seg1: 700, seg2: 710, seg3: 390 },
  ]
};

// 2. Future Tab Data
const futureData = {
  transactionHours: [
    { hour: '8', dark: 15, light: 8 },
    { hour: '9', dark: 42, light: 15 },
    { hour: '10', dark: 50, light: 30 },
    { hour: '11', dark: 58, light: 25 },
    { hour: '12', dark: 65, light: 42 },
    { hour: '1', dark: 72, light: 28 },
    { hour: '2', dark: 78, light: 35 },
    { hour: '3', dark: 85, light: 40 },
    { hour: '4', dark: 90, light: 22 },
    { hour: '5', dark: 95, light: 25 },
    { hour: '6', dark: 80, light: 20 },
  ],
  revenueTrend: [
    { name: 'P1', line1: 90, line2: 60, line3: 55 },
    { name: 'P2', line1: 80, line2: 30, line3: 75 },
    { name: 'P3', line1: 75, line2: 68, line3: 70 },
    { name: 'P4', line1: 50, line2: 100, line3: 98 },
    { name: 'P5', line1: 68, line2: 40, line3: 92 },
    { name: 'P6', line1: 42, line2: 62, line3: 40 },
    { name: 'P7', line1: 75, line2: 88, line3: 30 },
    { name: 'P8', line1: 82, line2: 25, line3: 100 },
    { name: 'P9', line1: 30, line2: 32, line3: 20 },
    { name: 'P10', line1: 92, line2: 58, line3: 85 },
    { name: 'P11', line1: 28, line2: 48, line3: 99 },
    { name: 'P12', line1: 85, line2: 82, line3: 50 },
  ],
  categorySales: [
    { category: 'C1', sales: 550 },
    { category: 'C2', sales: 950 },
    { category: 'C3', sales: 610 },
    { category: 'C4', sales: 720 },
    { category: 'C5', sales: 500 },
  ],
  topSpecificItems: [
    { category: 'C1', seg1: 900, seg2: 800, seg3: 480 },
    { category: 'C2', seg1: 600, seg2: 850, seg3: 520 },
    { category: 'C3', seg1: 700, seg2: 820, seg3: 580 },
    { category: 'C4', seg1: 710, seg2: 730, seg3: 450 },
    { category: 'C5', seg1: 800, seg2: 790, seg3: 460 },
  ]
};

export default function Demand() {
  const [demandMode, setDemandMode] = useState('current'); // 'current' | 'future'
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Dynamic Dataset Selection
  const activeDataSet = demandMode === 'future' ? futureData : currentData;

  const VIBRANT_COLORS = [
    '#2DD4BF', // Bright Teal
    '#2563EB', // Royal Blue
    '#0F172A', // Deep Midnight
    '#38BDF8', // Soft Sky Blue
    '#6366F1', // Indigo
    '#06B6D4', // Cyan
    '#4F46E5', // Dark Indigo
    '#0EA5E9', // Ocean Blue
  ];

  return (
    <>
        {/* ===== HEADER ====== */}
        <header className="relative z-30 flex items-center justify-between bg-gradient-to-r from-white via-white/90 to-blue-200/60 backdrop-blur-xl border border-white/80 rounded-3xl px-8 py-4 shadow-xl shadow-blue-500/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">AMPC</p>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                DEMAND FORECAST
              </h2>
            </div>
          </div>

          {/* ===== DEMAND TOGGLE BUTTONS & NOTIFICATIONS ===== */}
          <div className="flex items-center gap-3">
            {/* Current vs. Future Demand Toggle */}
            <div className="flex bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/80 backdrop-blur-md">
              <button
                onClick={() => setDemandMode('current')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 ${
                  demandMode === 'current'
                    ? 'bg-white text-blue-600 shadow-md shadow-blue-500/10'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                Current Demand
              </button>

              <button
                onClick={() => setDemandMode('future')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 ${
                  demandMode === 'future'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                Future Demand
              </button>
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
          </div>
       </header>
    

        {/* ======== 4 GRID CHARTS ============= */}

        <div className="grid grid-cols-2 grid-rows-2 gap-4 w-full h-screen">

          {/* ---------- TRANSACTION HRS ---------------*/}
          <div className="rounded-3xl bg-gradient-to-br from-white via-white/90 to-blue-200/60 backdrop-blur-xl border border-white/80 p-6 shadow-xl shadow-blue-500/10 hover:shadow-2xl hover:shadow-blue-500/15 transition-all duration-300 flex flex-col">
            <div className="flex items-center justify-center relative z-10 mb-4">
              <div>
                <h3 className="text-center text-lg font-bold text-slate-800">Transaction Hours</h3>
                <p className="text-center text-xs text-slate-500">Hourly activity breakdown</p>
              </div>
            </div>

            <div className="flex-1 w-full flex items-center justify-center min-h-0">
              <ResponsiveContainer width="99%" height="100%">
                <AreaChart data={activeDataSet.transactionHours} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="hour" stroke="#64748b" fontSize={12} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="dark" stroke="#2563EB" fill="#2563EB" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="light" stroke="#38BDF8" fill="#38BDF8" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ---------- REVENUE TREND ----------------- */}
          <div className="rounded-3xl bg-gradient-to-bl from-white via-white/90 to-blue-200/60 backdrop-blur-xl border border-white/80 p-6 shadow-xl shadow-blue-500/10 hover:shadow-2xl hover:shadow-blue-500/15 transition-all duration-300 flex flex-col">
            <div className="flex items-center justify-center relative z-10 mb-4">
              <div>
                <h3 className="text-center text-lg font-bold text-slate-800">Revenue Trend</h3>
                <p className="text-center text-xs text-slate-500">Period-over-period performance tracking</p>
              </div>
            </div>

            <div className="flex-1 w-full flex items-center justify-center min-h-0">
              <ResponsiveContainer width="99%" height="100%">
                <AreaChart data={activeDataSet.revenueTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Area type="linear" dataKey="line1" stroke="#0F172A" fill="#0F172A" fillOpacity={0.2} dot={{ r: 3, fill: '#0F172A' }} />
                  <Area type="linear" dataKey="line2" stroke="#2563EB" fill="#2563EB" fillOpacity={0.15} dot={{ r: 3, fill: '#2563EB' }} />
                  <Area type="linear" dataKey="line3" stroke="#38BDF8" fill="#38BDF8" fillOpacity={0.1} dot={{ r: 3, fill: '#38BDF8' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ------------ CATEGORY SALES ------------- */}
          <div className="rounded-3xl bg-gradient-to-tr from-white via-white/90 to-blue-200/60 backdrop-blur-xl border border-white/80 p-6 shadow-xl shadow-blue-500/10 hover:shadow-2xl hover:shadow-blue-500/15 transition-all duration-300 flex flex-col">
            <div className="flex items-center justify-center relative z-10 mb-4">
              <div>
                <h3 className="text-center text-lg font-bold text-slate-800">Category Sales</h3>
                <p className="text-center text-xs text-slate-500">Total revenue generated per category</p>
              </div>
            </div>

            <div className="flex-1 w-full flex items-center justify-center min-h-0">
              <ResponsiveContainer width="99%" height="100%">
                <BarChart data={activeDataSet.categorySales} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="category" stroke="#64748b" fontSize={12} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="sales" radius={[8, 8, 0, 0]}>
                    {activeDataSet.categorySales.map((entry, index) => (
                      <Cell key={`bar-cell-${index}`} fill={VIBRANT_COLORS[index % VIBRANT_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ------------- TOP SPECIFIC ITEMS ------------ */}
          <div className="rounded-3xl bg-gradient-to-tl from-white via-white/90 to-blue-200/60 backdrop-blur-xl border border-white/80 p-6 shadow-xl shadow-blue-500/10 hover:shadow-2xl hover:shadow-blue-500/15 transition-all duration-300 flex flex-col">
            <div className="flex items-center justify-center relative z-10 mb-4">
              <div>
                <h3 className="text-center text-lg font-bold text-slate-800">Top Specific Items</h3>
                <p className="text-center text-xs text-slate-500">Segmented volume metrics by product</p>
              </div>
            </div>

            <div className="flex-1 w-full flex items-center justify-center min-h-0">
              <ResponsiveContainer width="99%" height="100%">
                <BarChart data={activeDataSet.topSpecificItems} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="category" stroke="#64748b" fontSize={12} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="seg1" stackId="a" fill="#2563EB" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="seg2" stackId="a" fill="#38BDF8" />
                  <Bar dataKey="seg3" stackId="a" fill="#6366F1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </>
  );
}