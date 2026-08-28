import React, { useState } from 'react';
import { 
  Home, 
  Package, 
  BrainCircuit, 
  BarChart3,
  Bell, 
  TrendingUp, 
  Zap, 
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
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
  ResponsiveContainer
} from 'recharts';
import NotificationPanel from './NotificationPanel';

// --- DATA DEFINITIONS ---

// 1. Daily Revenue Line Chart Data
const dailyRevenueData = [
  { day: '1', line1: 25000, line2: 10000, line3: 3000 },
  { day: '2', line1: 24000, line2: 12000, line3: 11000 },
  { day: '3', line1: 47000, line2: 30000, line3: 11000 },
  { day: '4', line1: 31000, line2: 22500, line3: 5000 },
  { day: '5', line1: 36000, line2: 30000, line3: 16000 },
  { day: '6', line1: 28000, line2: 13000, line3: 9000 },
  { day: '8', line1: 38000, line2: 19000, line3: 4000 },
];

// 2. Monthly Revenue Line Chart Data
const monthlyRevenueData = [
  { month: 'JAN', line1: 530000, line2: 470000 },
  { month: 'FEB', line1: 630000, line2: 600000 },
  { month: 'MAR', line1: 390000, line2: 220000 },
  { month: 'APR', line1: 760000, line2: 580000 },
  { month: 'MAY', line1: 490000, line2: 300000 },
  { month: 'JUN', line1: 490000, line2: 380000 },
  { month: 'JUL', line1: 960000, line2: 760000 },
  { month: 'AUG', line1: 320000, line2: 120000 },
  { month: 'SEP', line1: 760000, line2: 730000 },
  { month: 'OCT', line1: 660000, line2: 630000 },
  { month: 'NOV', line1: 750000, line2: 660000 },
  { month: 'DEC', line1: 700000, line2: 630000 },
];

// 3. Inventory Balance Donut Chart Data
const inventoryBalanceData = [
  { name: 'C1', value: 800 },
  { name: 'C2', value: 600 },
  { name: 'C3', value: 300 },
  { name: 'C4', value: 700 },
  { name: 'C5', value: 450 },
  { name: 'C6', value: 500 },
  { name: 'C7', value: 220 },
  { name: 'C8', value: 650 },
  { name: 'C9', value: 380 },
  { name: 'C10', value: 420 },
  { name: 'C11', value: 300 },
  { name: 'C12', value: 348 },
];

export default function Finance() {
  const [activeTab, setActiveTab] = useState('finance');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeMonth, setActiveMonth] = useState('JUL');
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const metrics = [
    {
      title: 'Predicted Demand',
      value: '24,850 Units',
      change: '+14.2%',
      isPositive: true,
      subtext: 'vs. last month',
      icon: TrendingUp,
    },
    {
      title: 'Optimal Inventory',
      value: '18,200 Units',
      change: '+5.1%',
      isPositive: true,
      subtext: 'Target balance',
      icon: Package,
    },
    {
      title: 'AI Model Accuracy',
      value: '96.8%',
      change: '+2.4%',
      isPositive: true,
      subtext: 'High confidence',
      icon: BrainCircuit,
    },
    {
      title: 'Stockout Risk',
      value: '2.1%',
      change: '-1.8%',
      isPositive: true,
      subtext: 'Risk level low',
      icon: Zap,
    },
  ];

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
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">AMPC</p>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                FINANCIAL ANALYTICS
              </h2>
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

        {/* ===== 4 SMALL BOX ===== */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {metrics.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/80 via-blue-100/30 to-indigo-300/40 backdrop-blur-xl border border-white/80 p-5 shadow-xl shadow-blue-500/10 hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300"
              >
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-sky-300/40 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
                <div className="flex items-center justify-between mb-3 relative z-10">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    {item.title}
                  </span>
                  <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 text-white shadow-md shadow-blue-500/30">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-1 relative z-10">
                  {item.value}
                </h3>
                <div className="flex items-center gap-1.5 text-xs relative z-10">
                  <span className={`inline-flex items-center font-bold px-2 py-0.5 rounded-lg bg-white/60 backdrop-blur-md shadow-sm ${item.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {item.isPositive ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                    {item.change}
                  </span>
                  <span className="text-slate-500 font-medium">{item.subtext}</span>
                </div>
              </div>
            );
          })}
        </section>

        {/* ======= CHARTS SECTION ========== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* --------- Daily Revenue Chart -----------*/}
          <div className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-tr from-white via-white/90 to-blue-200/60 backdrop-blur-xl border border-white/80 border border-white/80 p-6 shadow-xl shadow-blue-500/10 hover:shadow-2xl hover:shadow-blue-500/15 transition-all duration-300 flex flex-col justify-between">
            <div className="absolute top-0 left-0 w-64 h-64 bg-sky-300/40 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between mb-4 relative z-10">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Daily Revenue Trends</h3>
                <p className="text-xs text-slate-500">Day-by-day revenue line metrics</p>
              </div>
            </div>
            <div className="h-64 w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyRevenueData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff80" />
                  <XAxis dataKey="day" stroke="#475569" fontSize={12} tickLine={false} />
                  <YAxis 
                    stroke="#475569" 
                    fontSize={12} 
                    tickLine={false} 
                    tickFormatter={(value) => `₱${value / 1000}k`} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.85)', 
                      backdropFilter: 'blur(12px)',
                      borderRadius: '16px',
                      border: '1px solid rgba(255,255,255,0.8)',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
                    }} 
                  />
                  <Line type="monotone" dataKey="line1" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="line2" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="line3" stroke="#0ea5e9" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ------------- Inventory Balance ----------------  */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-white via-white/90 to-blue-200/60 backdrop-blur-xl border border-white/80 rounded-3xl px-8 py-4 shadow-xl shadow-blue-500/10 flex flex-col justify-between">
            <div className="absolute top-0 left-0 w-64 h-64 bg-sky-300/40 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <h3 className="text-lg font-bold text-slate-800">Inventory Distribution</h3>
              <p className="text-xs text-slate-500">Category Balance Proportion</p>
            </div>
            
            <div className="h-64 w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={inventoryBalanceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                   {inventoryBalanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={VIBRANT_COLORS[index % VIBRANT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.85)', 
                      backdropFilter: 'blur(12px)',
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.8)'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Exactly Centered Inner Content */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-xl font-black text-slate-800 leading-tight">5.4k</span>
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Total Units</span>
              </div>
            </div>
          </div>

        </div>

        {/*------------- MONTHLY REVENUE ================= */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border border-slate-800 p-6 shadow-2xl transition-all duration-300">
          
          {/* Subtle Backlight Radial Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header & Legend */}
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Monthly Revenue Projections</h3>
              <p className="text-xs text-slate-400">12-Month revenue forecasting comparison</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-sky-400">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-sm shadow-sky-400/50" /> Target
              </span>
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-blue-500">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" /> Revenue
              </span>
            </div>
          </div>

          {/* Chart Canvas */}
          <div className="h-56 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyRevenueData} margin={{ top: 15, right: 10, left: -9, bottom: 0 }}>
                {/* Horizontal Minimal Gridlines */}
                <CartesianGrid strokeDasharray="0" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" hide />
                <YAxis 
                  stroke="#475569" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `₱${value / 1000}k`}
                />
                
                {/* Custom Hover Vertical Cursor Line */}
                <Tooltip 
                  cursor={{ stroke: '#38bdf8', strokeWidth: 1.5, strokeDasharray: '3 3' }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    backdropFilter: 'blur(12px)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)'
                  }} 
                />

                {/* Primary Light Sky Smooth Line */}
                <Line 
                  type="monotone" 
                  dataKey="line1" 
                  stroke="#38bdf8" 
                  strokeWidth={2.5} 
                  dot={false}
                  activeDot={{ r: 6, fill: '#38bdf8', stroke: '#ffffff', strokeWidth: 2 }}
                />
                
                {/* Secondary Deep Blue Smooth Line */}
                <Line 
                  type="monotone" 
                  dataKey="line2" 
                  stroke="#3b82f6" 
                  strokeWidth={2.5} 
                  dot={false}
                  activeDot={{ r: 6, fill: '#3b82f6', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Month Navigation Pill Bar */}
          <div className="mt-4 grid grid-cols-12 gap-1 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 relative z-10 items-center">
            {monthlyRevenueData.map((item) => {
              const isSelected = activeMonth === item.month;
              return (
                <button
                  key={item.month}
                  onClick={() => setActiveMonth(item.month)}
                  className={`h-6 flex items-center justify-center rounded-xl text-xs font-bold transition-all text-center ${
                    isSelected
                      ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  {item.month}
                </button>
              );
            })}
          </div>

        </div>

      </>
  );
}