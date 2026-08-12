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
  Image as ImageIcon 
} from 'lucide-react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

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

// 2. Future Tab Data (Forecasted projections)
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

export default function DemandForecast() {
  const [activeTab, setActiveTab] = useState('Future'); // 'Current' or 'Future'
  const [isExpanded, setIsExpanded] = useState(false);

  // Router hooks for dynamic active state and navigation
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation handlers
  const handleNavigate = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsExpanded((prev) => !prev);
  };

  // Pick dataset based on active tab
  const activeData = activeTab === 'Current' ? currentData : futureData;

  return (
    <div className="relative h-screen w-screen bg-[#EAE8FE] flex flex-col font-sans overflow-hidden select-none">
      
      {/* Top Header Breadcrumb */}
      <div className="pt-2 pl-3 sm:pl-4 text-gray-500 font-semibold text-[10px] sm:text-xs tracking-wider uppercase z-20 shrink-0">
        AIMS - IM - ADMIN - FORECAST
      </div>

      {/* Main App Box */}
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
              {isExpanded && <span className="hidden md:inline text-xs font-bold text-gray-700">Menu</span>}
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

          {/* DEMAND CONTENT CONTAINER */}
          <div className="bg-[#F5F5F5] rounded-2xl p-4 sm:p-5 border border-gray-200/80 flex-1 flex flex-col min-h-0">
            
            {/* DEMAND TITLE & TABS */}
            <div className="shrink-0 mb-4 border-b border-gray-300/80 pb-1">
              <h2 className="text-sm sm:text-base font-black text-black tracking-wider uppercase mb-2">
                DEMAND
              </h2>

              <div className="flex justify-center items-center gap-12 sm:gap-20 text-xs sm:text-sm font-bold">
                {/* Current Tab */}
                <button
                  type="button"
                  onClick={() => setActiveTab('Current')}
                  className={`relative pb-2 transition-all cursor-pointer ${
                    activeTab === 'Current' 
                      ? 'text-black font-black' 
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  Current
                  {activeTab === 'Current' && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gray-400 rounded-full" />
                  )}
                </button>

                {/* Future Tab */}
                <button
                  type="button"
                  onClick={() => setActiveTab('Future')}
                  className={`relative pb-2 transition-all cursor-pointer ${
                    activeTab === 'Future' 
                      ? 'text-black font-black' 
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  Future
                  {activeTab === 'Future' && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gray-400 rounded-full" />
                  )}
                </button>
              </div>
            </div>

            {/* DASHBOARD GRID CHART CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0 overflow-y-auto pr-1">
              
              {/* CARD 1: TRANSACTION HOURS */}
              <div className="bg-[#E4E4E4] rounded-2xl p-3 border border-gray-300/60 flex flex-col items-center">
                <div className="bg-[#D8D8D8] text-gray-700 text-[10px] font-bold px-4 py-1 rounded-full border border-gray-400/40 uppercase mb-2">
                  TRANSACTION HOURS
                </div>
                
                <div className="w-full flex-1 min-h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activeData.transactionHours} margin={{ top: 10, right: 10, left: -25, bottom: 15 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ccc" />
                      <XAxis 
                        dataKey="hour" 
                        tick={{ fontSize: 9, fill: '#555' }}
                        label={{ value: 'HOUR OF DAY (8 AM - 6 PM)', position: 'insideBottom', offset: -10, fontSize: 8, fill: '#444', fontWeight: 'bold' }}
                      />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#555' }} />
                      <Tooltip />
                      <Bar dataKey="dark" fill="#525252" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="light" fill="#9CA3AF" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* CARD 2: REVENUE TREND */}
              <div className="bg-[#E4E4E4] rounded-2xl p-3 border border-gray-300/60 flex flex-col items-center">
                <div className="bg-[#D8D8D8] text-gray-700 text-[10px] font-bold px-4 py-1 rounded-full border border-gray-400/40 uppercase mb-2">
                  REVENUE TREND
                </div>

                <div className="w-full flex-1 min-h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activeData.revenueTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                      <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#555' }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#555' }} />
                      <Tooltip />
                      <Area type="linear" dataKey="line1" stroke="#374151" fill="#4B5563" fillOpacity={0.3} dot={{ r: 2 }} />
                      <Area type="linear" dataKey="line2" stroke="#6B7280" fill="#9CA3AF" fillOpacity={0.3} dot={{ r: 2 }} />
                      <Area type="linear" dataKey="line3" stroke="#9CA3AF" fill="#D1D5DB" fillOpacity={0.2} dot={{ r: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* CARD 3: CATEGORY SALES */}
              <div className="bg-[#E4E4E4] rounded-2xl p-3 border border-gray-300/60 flex flex-col items-center">
                <div className="bg-[#D8D8D8] text-gray-700 text-[10px] font-bold px-4 py-1 rounded-full border border-gray-400/40 uppercase mb-2">
                  CATEGORY SALES
                </div>

                <div className="w-full flex-1 min-h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activeData.categorySales} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ccc" />
                      <XAxis dataKey="category" tick={{ fontSize: 9, fill: '#555' }} />
                      <YAxis domain={[0, 900]} ticks={[0, 150, 300, 450, 600, 750, 900]} tick={{ fontSize: 9, fill: '#555' }} />
                      <Tooltip />
                      <Bar dataKey="sales" fill="#6B7280" barSize={35} radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* CARD 4: TOP SPECIFIC ITEMS */}
              <div className="bg-[#E4E4E4] rounded-2xl p-3 border border-gray-300/60 flex flex-col items-center">
                <div className="bg-[#D8D8D8] text-gray-700 text-[10px] font-bold px-4 py-1 rounded-full border border-gray-400/40 uppercase mb-2">
                  TOP SPECIFIC ITEMS
                </div>

                <div className="w-full flex-1 min-h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activeData.topSpecificItems} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ccc" />
                      <XAxis dataKey="category" tick={{ fontSize: 9, fill: '#555' }} />
                      <YAxis domain={[0, 2000]} ticks={[0, 400, 800, 1200, 1600, 2000]} tick={{ fontSize: 9, fill: '#555' }} />
                      <Tooltip />
                      <Bar dataKey="seg3" stackId="a" fill="#2D4A53" barSize={35} />
                      <Bar dataKey="seg2" stackId="a" fill="#8E9399" />
                      <Bar dataKey="seg1" stackId="a" fill="#B3B7BC" radius={[2, 2, 0, 0]} />
                    </BarChart>
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