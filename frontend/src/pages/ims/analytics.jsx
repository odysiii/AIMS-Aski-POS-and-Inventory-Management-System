import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Package, 
  TrendingUp, 
  BarChart2, 
  Menu, 
  Settings, 
  LogOut, 
  Bell, 
  Image as ImageIcon,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
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

// --- DATA DEFINITIONS ---

const revenueByMonth = [
  { month: 'Jan', revenue: 42000 },
  { month: 'Feb', revenue: 38500 },
  { month: 'Mar', revenue: 51000 },
  { month: 'Apr', revenue: 47500 },
  { month: 'May', revenue: 61000 },
  { month: 'Jun', revenue: 58500 },
  { month: 'Jul', revenue: 67000 },
  { month: 'Aug', revenue: 72500 },
];

const topProducts = [
  { name: 'Product A', sales: 1240 },
  { name: 'Product B', sales: 980 },
  { name: 'Product C', sales: 860 },
  { name: 'Product D', sales: 620 },
  { name: 'Product E', sales: 410 },
];

const categoryBreakdown = [
  { name: 'Category 1', value: 400 },
  { name: 'Category 2', value: 300 },
  { name: 'Category 3', value: 220 },
  { name: 'Category 4', value: 180 },
];

const PIE_COLORS = ['#374151', '#6B7280', '#9CA3AF', '#D1D5DB'];

const kpiCards = [
  { label: 'TOTAL REVENUE', value: 'PHP 438,200', change: '+12.4%', trend: 'up' },
  { label: 'TOTAL ORDERS', value: '2,318', change: '+5.1%', trend: 'up' },
  { label: 'AVG. ORDER VALUE', value: 'PHP 189', change: '-2.3%', trend: 'down' },
  { label: 'RETURN RATE', value: '3.2%', change: '+0.4%', trend: 'down' },
];

export default function Analytics() {
  const [isExpanded, setIsExpanded] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <div className="relative h-screen w-screen bg-[#EAE8FE] flex flex-col font-sans overflow-hidden select-none">
      
      {/* Top Header Breadcrumb */}
      <div className="pt-2 pl-3 sm:pl-4 text-gray-500 font-semibold text-[10px] sm:text-xs tracking-wider uppercase z-20 shrink-0">
        AIMS - IM - ADMIN - ANALYTICS
      </div>

      {/* Main Container Wrapper */}
      <div className="relative flex-1 m-2 sm:m-3 md:m-4 mt-1 rounded-2xl overflow-hidden flex flex-col md:flex-row gap-2 sm:gap-3 min-h-0">
        
        {/* COLLAPSIBLE SIDEBAR */}
        <div 
          className={`bg-[#EDEDED] rounded-2xl flex md:flex-col justify-between p-2 md:py-4 shrink-0 shadow-sm border border-white/60 transition-all duration-300 ease-in-out ${
            isExpanded ? 'md:w-48 md:px-3' : 'md:w-16 items-center'
          }`}
        >
          {/* Top Nav Group */}
          <div className="flex md:flex-col items-center gap-2 md:gap-3 w-full">
            <button 
              type="button"
              onClick={toggleSidebar}
              className={`p-2 text-gray-600 hover:text-black hover:bg-gray-200 rounded-xl transition-all flex items-center ${
                isExpanded ? 'w-full justify-start gap-3 px-2.5' : 'justify-center'
              }`}
            >
              <Menu className="w-5 h-5 shrink-0" />
              {isExpanded && <span className="hidden md:inline text-xs font-bold text-gray-700">Collapse</span>}
            </button>

            {/* Home button */}
            <button 
              type="button" 
              onClick={() => handleNavigate('/adminDashboard')}
              className={`p-2 ${location.pathname === '/adminDashboard' ? 'text-black bg-gray-200' : 'text-gray-500 hover:text-black hover:bg-gray-200'} rounded-xl transition-all flex items-center ${
                isExpanded ? 'w-full justify-start gap-3 px-3' : 'justify-center'
              }`}
            >
              <Home className="w-5 h-5 shrink-0" />
              {isExpanded && <span className="hidden md:inline text-xs font-bold whitespace-nowrap">Home</span>}
            </button>

            {/* Inventory button */}
            <button 
              type="button" 
              onClick={() => handleNavigate('/inventoryList')}
              className={`p-2 ${location.pathname === '/inventoryList' ? 'text-black bg-gray-200' : 'text-gray-500 hover:text-black hover:bg-gray-200'} rounded-xl transition-all flex items-center ${
                isExpanded ? 'w-full justify-start gap-3 px-3' : 'justify-center'
              }`}
            >
              <Package className="w-5 h-5 shrink-0" />
              {isExpanded && <span className="hidden md:inline text-xs font-bold text-gray-700 whitespace-nowrap">Inventory</span>}
            </button>

            {/* Forecast button */}
            <button 
              type="button"
              onClick={() => handleNavigate('/demand')}
              className={`p-2 ${location.pathname === '/demand' || location.pathname === '/demand' ? 'text-black bg-gray-200' : 'text-gray-500 hover:text-black hover:bg-gray-200'} rounded-xl transition-all flex items-center ${
                isExpanded ? 'w-full justify-start gap-3 px-3' : 'justify-center'
              }`}
            >
              <TrendingUp className="w-5 h-5 shrink-0" />
              {isExpanded && <span className="hidden md:inline text-xs font-bold text-gray-700 whitespace-nowrap">Forecast</span>}
            </button>

            {/* Analytics button */}
            <button 
              type="button"
              onClick={() => handleNavigate('/analytics')}
              className={`p-2 ${location.pathname === '/analytics' ? 'text-black bg-gray-200' : 'text-gray-500 hover:text-black hover:bg-gray-200'} rounded-xl transition-all flex items-center ${
                isExpanded ? 'w-full justify-start gap-3 px-3' : 'justify-center'
              }`}
            >
              <BarChart2 className="w-5 h-5 shrink-0" />
              {isExpanded && <span className="hidden md:inline text-xs font-bold text-gray-700 whitespace-nowrap">Analytics</span>}
            </button>
          </div>

          {/* Bottom Nav Group */}
          <div className="flex md:flex-col items-center gap-2 w-full justify-end">
            {/* Settings button */}
            <button 
              type="button"
              onClick={() => handleNavigate('/settings')}
              className={`p-2 ${location.pathname === '/settings' ? 'text-black bg-gray-200' : 'text-gray-500 hover:text-black hover:bg-gray-200'} rounded-xl transition-all flex items-center ${
                isExpanded ? 'w-full justify-start gap-3 px-3' : 'justify-center'
              }`}
            >
              <Settings className="w-5 h-5 shrink-0" />
              {isExpanded && <span className="hidden md:inline text-xs font-bold text-gray-700 whitespace-nowrap">Settings</span>}
            </button>

            {/* Logout button */}
            <button 
              type="button"
              onClick={handleLogout}
              className={`p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all flex items-center ${
                isExpanded ? 'w-full justify-start gap-3 px-3' : 'justify-center'
              }`}
            >
              <LogOut className="w-5 h-5 shrink-0" />
              {isExpanded && <span className="hidden md:inline text-xs font-bold text-red-600 whitespace-nowrap">Logout</span>}
            </button>
          </div>
        </div>

        {/* MAIN PANEL */}
        <div className="flex-1 bg-[#EDEDED] rounded-2xl p-3 sm:p-4 flex flex-col gap-3 overflow-y-auto border border-white/60 shadow-sm min-h-0">
          
          {/* HEADER BAR */}
          <div className="flex items-center justify-between shrink-0 mb-1">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gray-300 flex items-center justify-center border border-gray-400/40">
                <ImageIcon className="w-4 h-4 text-gray-600" />
              </div>
              <h1 className="text-xs sm:text-sm font-black text-black tracking-wide uppercase">
                INVENTORY MANAGEMENT
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button 
                type="button"
                onClick={() => handleNavigate('/notifications')}
                className="p-1.5 text-gray-700 hover:bg-gray-300/60 rounded-full transition-all"
              >
                <Bell className="w-4 h-4" />
              </button>
              <span className="text-xs font-black text-gray-800 hidden sm:inline">Hi, Admin!</span>
              <button
                type="button"
                onClick={() => handleNavigate('/profile')}
                className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center border border-gray-400/40 hover:opacity-80 transition-opacity"
              >
                <ImageIcon className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* ANALYTICS CONTENT CONTAINER */}
          <div className="bg-[#F5F5F5] rounded-2xl p-4 sm:p-5 border border-gray-200/80 flex-1 flex flex-col gap-4 min-h-0 overflow-y-auto">
            
            {/* ANALYTICS TITLE */}
            <div className="shrink-0 border-b border-gray-300/80 pb-2">
              <h2 className="text-sm sm:text-base font-black text-black tracking-wider uppercase">
                ANALYTICS
              </h2>
            </div>

            {/* KPI CARDS ROW */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
              {kpiCards.map((kpi, idx) => (
                <div key={idx} className="bg-[#E4E4E4] rounded-2xl p-3 border border-gray-300/60 flex flex-col gap-1">
                  <span className="text-[9px] sm:text-[10px] font-bold text-gray-600 uppercase tracking-wide">
                    {kpi.label}
                  </span>
                  <span className="text-base sm:text-lg font-black text-black">
                    {kpi.value}
                  </span>
                  <span className={`flex items-center gap-1 text-[10px] font-bold ${
                    kpi.trend === 'up' ? 'text-emerald-700' : 'text-red-600'
                  }`}>
                    {kpi.trend === 'up' 
                      ? <ArrowUpRight className="w-3 h-3" /> 
                      : <ArrowDownRight className="w-3 h-3" />}
                    {kpi.change}
                  </span>
                </div>
              ))}
            </div>

            {/* CHART GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">

              {/* REVENUE OVER TIME */}
              <div className="bg-[#E4E4E4] rounded-2xl p-3 border border-gray-300/60 flex flex-col items-center">
                <div className="bg-[#D8D8D8] text-gray-700 text-[10px] font-bold px-4 py-1 rounded-full border border-gray-400/40 uppercase mb-2">
                  REVENUE OVER TIME
                </div>
                <div className="w-full flex-1 min-h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueByMonth} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                      <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#555' }} />
                      <YAxis tick={{ fontSize: 9, fill: '#555' }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="revenue" stroke="#374151" strokeWidth={2} dot={{ r: 3, fill: '#374151' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* TOP PRODUCTS */}
              <div className="bg-[#E4E4E4] rounded-2xl p-3 border border-gray-300/60 flex flex-col items-center">
                <div className="bg-[#D8D8D8] text-gray-700 text-[10px] font-bold px-4 py-1 rounded-full border border-gray-400/40 uppercase mb-2">
                  TOP PRODUCTS
                </div>
                <div className="w-full flex-1 min-h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topProducts} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#ccc" />
                      <XAxis type="number" tick={{ fontSize: 9, fill: '#555' }} />
                      <YAxis dataKey="name" type="category" width={70} tick={{ fontSize: 9, fill: '#555' }} />
                      <Tooltip />
                      <Bar dataKey="sales" fill="#6B7280" radius={[0, 2, 2, 0]} barSize={16} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* CATEGORY BREAKDOWN */}
              <div className="bg-[#E4E4E4] rounded-2xl p-3 border border-gray-300/60 flex flex-col items-center md:col-span-2">
                <div className="bg-[#D8D8D8] text-gray-700 text-[10px] font-bold px-4 py-1 rounded-full border border-gray-400/40 uppercase mb-2">
                  CATEGORY BREAKDOWN
                </div>
                <div className="w-full flex-1 min-h-[200px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryBreakdown}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        label={{ fontSize: 9, fill: '#333' }}
                      >
                        {categoryBreakdown.map((entry, idx) => (
                          <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}