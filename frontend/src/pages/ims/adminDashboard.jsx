import React, { useState } from 'react';
import {useNavigate, useLocation} from 'react-router-dom';
import { 
  Home, 
  Package, 
  TrendingUp, 
  BarChart2, 
  Settings, 
  LogOut, 
  Bell, 
  Banknote, 
  AlertTriangle, 
  Menu,
  Image as ImageIcon,
  Form
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

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
  const [isExpanded, setIsExpanded] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="relative h-screen w-screen bg-[#EAE8FE] flex flex-col font-sans overflow-hidden select-none">
      
      {/* Top Header Breadcrumb */}
      <div className="pt-2 pl-3 sm:pl-4 text-gray-500 font-semibold text-[10px] sm:text-xs tracking-wider uppercase z-20 shrink-0">
        AIMS - IM - ADMIN - HOME
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
              onClick={() => setIsExpanded(!isExpanded)}
              className={`p-2 text-gray-600 hover:text-black hover:bg-gray-200 rounded-xl transition-all flex items-center ${
                isExpanded ? 'w-full justify-start gap-3 px-2.5' : 'justify-center'
              }`}
            >
              <Menu className="w-5 h-5 shrink-0" />
              {isExpanded && <span className="hidden md:inline text-xs font-bold text-gray-700">Menu</span>}
            </button>

            {/*Home button */}
            <button type="button" onClick={() => navigate('/adminDashboard')}
            className={`p-2 ${location.pathname === '/adminDashboard' ? 'bg-[#C0C0C0] text-gray-800' : 'text-gray-500 hover:text-black hover:bg-gray-200'}
             rounded-xl md:rounded-2xl shadow-sm flex items-center ${
              isExpanded ? 'w-full justify-start gap-3 px-3' : 'justify-center'
            }`}>
              <Home className="w-5 h-5 shrink-0" />
              {isExpanded && <span className="hidden md:inline text-xs font-bold whitespace-nowrap">Home</span>}
            </button>

            {/*Inventory button */}
            <button type="button" onClick={() => navigate('/inventoryList')}
            className={`p-2 ${location.pathname === '/inventoryList' ? 'bg-[#C0C0C0] text-gray-800' : 'text-gray-500 hover:text-black hover:bg-gray-200'} rounded-xl transition-all flex items-center ${
              isExpanded ? 'w-full justify-start gap-3 px-3' : 'justify-center'
            }`}>
              <Package className="w-5 h-5 shrink-0" />
              {isExpanded && <span className="hidden md:inline text-xs font-bold text-gray-700 whitespace-nowrap">Inventory</span>}
            </button>

            {/*Forecast button */}
            <button type="button" onClick={() => navigate('/demand')}
            className={`p-2 ${location.pathname === '/demand' ? 'bg-[#C0C0C0] text-gray-800' : 'text-gray-500 hover:text-black hover:bg-gray-200'} rounded-xl transition-all flex items-center ${
              isExpanded ? 'w-full justify-start gap-3 px-3' : 'justify-center'
            }`}>
              <TrendingUp className="w-5 h-5 shrink-0" />
              {isExpanded && <span className="hidden md:inline text-xs font-bold text-gray-700 whitespace-nowrap">Forecast</span>}
            </button>

            {/*Analytics button */}
            <button type="button" onClick={() => navigate('/analytics')}
            className={`p-2 ${location.pathname === '/analytics' ? 'bg-[#C0C0C0] text-gray-800' : 'text-gray-500 hover:text-black hover:bg-gray-200'} rounded-xl transition-all flex items-center ${
              isExpanded ? 'w-full justify-start gap-3 px-3' : 'justify-center'
            }`}>
              <BarChart2 className="w-5 h-5 shrink-0" />
              {isExpanded && <span className="hidden md:inline text-xs font-bold text-gray-700 whitespace-nowrap">Analytics</span>}
            </button>
          </div>

          {/* Bottom Nav Group */}
          <div className="flex md:flex-col items-center gap-2 w-full justify-end">
            
            {/* Settings button */}
            <button type="button" onClick={() => navigate('/settings')}
            className={`p-2 ${location.pathname === '/settings' ? 'bg-[#C0C0C0] text-gray-800' : 'text-gray-500 hover:text-black hover:bg-gray-200'} rounded-xl transition-all flex items-center ${
              isExpanded ? 'w-full justify-start gap-3 px-3' : 'justify-center'
            }`}>
              <Settings className="w-5 h-5 shrink-0" />
              {isExpanded && <span className="hidden md:inline text-xs font-bold text-gray-700 whitespace-nowrap">Settings</span>}
            </button>

            {/* Logout button */} 
            <button type="button" onClick={() => navigate('/login')}
            className={`p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all flex items-center ${
              isExpanded ? 'w-full justify-start gap-3 px-3' : 'justify-center'
            }`}>
              <LogOut className="w-5 h-5 shrink-0" />
              {isExpanded && <span className="hidden md:inline text-xs font-bold text-red-600 whitespace-nowrap">Logout</span>}
            </button>
          </div>
        </div>

        {/* MAIN DASHBOARD CONTENT AREA */}
        <div className="flex-1 bg-[#EDEDED] rounded-2xl p-3 sm:p-4 flex flex-col gap-3 overflow-y-auto border border-white/60 shadow-sm min-h-0">
          
          {/* TOP BAR */}
          <div className="flex items-center justify-between shrink-0 mb-1 gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gray-300 flex items-center justify-center border border-gray-400/40 shrink-0">
                <ImageIcon className="w-4 h-4 text-gray-600" />
              </div>
              <h1 className="text-xs sm:text-sm md:text-base font-black text-black tracking-wide uppercase truncate">
                INVENTORY MANAGEMENT
              </h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button className="p-1.5 sm:p-2 text-gray-700 hover:bg-gray-300/60 rounded-full transition-all cursor-pointer">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <span className="text-[11px] sm:text-xs font-black text-gray-800 hidden sm:inline">Hi, Admin!</span>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-300 flex items-center justify-center border border-gray-400/40 shrink-0">
                <ImageIcon className="w-4 h-4 text-gray-600" />
              </div>
            </div>
          </div>

          {/* MAIN GRID SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 min-h-0">
            
            {/* LEFT COLUMN */}
            <div className="lg:col-span-8 flex flex-col gap-3">
              
              {/* TOP METRICS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-[#D9D9D9] p-3 sm:p-4 rounded-xl flex items-start justify-between shadow-xs">
                  <div>
                    <h3 className="text-[10px] sm:text-xs font-bold text-gray-800 uppercase tracking-wide mb-1 sm:mb-2">
                      TOTAL REVENUE TODAY
                    </h3>
                    <p className="text-xl sm:text-2xl md:text-3xl font-black text-black tracking-tight">
                      PHP 30,550
                    </p>
                  </div>
                  <div className="p-2 bg-gray-400/30 rounded-lg shrink-0">
                    <Banknote className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                  </div>
                </div>

                <div className="bg-[#D9D9D9] p-3 sm:p-4 rounded-xl flex items-start justify-between shadow-xs">
                  <div>
                    <h3 className="text-[10px] sm:text-xs font-bold text-gray-800 uppercase tracking-wide mb-1 sm:mb-2">
                      LOW STOCKS ALERT
                    </h3>
                    <p className="text-xl sm:text-2xl md:text-3xl font-black text-black tracking-tight">
                      5 ITEMS
                    </p>
                  </div>
                  <div className="p-2 bg-gray-400/30 rounded-lg shrink-0">
                    <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                  </div>
                </div>
              </div>

              {/* DAILY SALES TREND CHART */}
              <div className="bg-[#D9D9D9] p-3 rounded-xl flex-1 flex flex-col min-h-[200px] sm:min-h-[220px]">
                <h3 className="text-[10px] sm:text-xs font-bold text-gray-800 uppercase tracking-wide mb-2">
                  DAILY SALES TREND
                </h3>
                <div className="flex-1 w-full min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailySalesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4B5563" stopOpacity={0.6}/>
                          <stop offset="95%" stopColor="#4B5563" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#C2C2C2" vertical={false} />
                      <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#4B5563' }} />
                      <YAxis tick={{ fontSize: 9, fill: '#4B5563' }} domain={[0, 10000]} ticks={[0, 2000, 4000, 6000, 8000, 10000]} />
                      <Tooltip />
                      <Area type="monotone" dataKey="sales" stroke="#374151" strokeWidth={2} fillOpacity={1} fill="url(#salesGrad)" dot={{ r: 3, fill: '#374151' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* RECENT TRANSACTIONS TABLE */}
              <div className="bg-[#D9D9D9] p-3 rounded-xl flex flex-col">
                <h3 className="text-[10px] sm:text-xs font-bold text-gray-800 uppercase tracking-wide mb-2">
                  RECENT TRANSACTIONS
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[10px] sm:text-[11px]">
                    <thead>
                      <tr className="text-gray-600 border-b border-gray-400/40">
                        <th className="pb-1.5 font-bold">Date</th>
                        <th className="pb-1.5 font-bold">Transaction ID</th>
                        <th className="pb-1.5 font-bold text-center">Amount</th>
                        <th className="pb-1.5 font-bold text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-400/20 font-medium text-gray-800">
                      {recentTransactions.map((tx, idx) => (
                        <tr key={idx} className="hover:bg-gray-400/10 transition-colors">
                          <td className="py-1.5 whitespace-nowrap">{tx.date}</td>
                          <td className="py-1.5 font-mono whitespace-nowrap">{tx.id}</td>
                          <td className="py-1.5 text-center font-bold whitespace-nowrap">{tx.amount}</td>
                          <td className="py-1.5 text-right font-bold whitespace-nowrap">{tx.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN */}
            <div className="lg:col-span-4 flex flex-col gap-3">
              
              {/* AI DEMAND FORECAST CHART */}
              <div className="bg-[#D9D9D9] p-3 rounded-xl flex-1 flex flex-col min-h-[200px] sm:min-h-[220px]">
                <h3 className="text-[10px] sm:text-xs font-bold text-gray-800 uppercase tracking-wide mb-2">
                  AI DEMAND FORECAST
                </h3>
                <div className="flex-1 w-full min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={demandForecastData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="demandGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6B7280" stopOpacity={0.6}/>
                          <stop offset="95%" stopColor="#6B7280" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#C2C2C2" />
                      <XAxis dataKey="month" tick={{ fontSize: 8, fill: '#4B5563' }} />
                      <YAxis tick={{ fontSize: 8, fill: '#4B5563' }} domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} />
                      <Tooltip />
                      <Area type="monotone" dataKey="demand" stroke="#4B5563" strokeWidth={2} fillOpacity={1} fill="url(#demandGrad)" dot={{ r: 3, fill: '#4B5563' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* EXPIRY WATCHLIST */}
              <div className="bg-[#D9D9D9] p-3 rounded-xl flex flex-col flex-1 min-h-[180px] sm:min-h-[220px]">
                <h3 className="text-[10px] sm:text-xs font-bold text-gray-800 uppercase tracking-wide mb-2">
                  EXPIRY WATCHLIST
                </h3>
                <div className="overflow-y-auto flex-1 pr-1 max-h-[180px] sm:max-h-[220px]">
                  <table className="w-full text-left text-[10px] sm:text-[11px]">
                    <thead>
                      <tr className="text-gray-600 border-b border-gray-400/40 sticky top-0 bg-[#D9D9D9]">
                        <th className="pb-1 font-bold">Product</th>
                        <th className="pb-1 font-bold text-right">Days until Expiry</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-400/20 font-medium text-gray-800">
                      {expiryWatchlist.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-400/10 transition-colors">
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

      </div>
    </div>
  );
}