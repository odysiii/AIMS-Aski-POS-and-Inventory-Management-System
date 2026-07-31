import React from 'react';
import { 
  Home, 
  Settings, 
  LogOut, 
  Bell, 
  Image as ImageIcon 
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
  { month: '1', line1: 530000, line2: 470000, line3: 470000 },
  { month: '2', line1: 630000, line2: 600000, line3: 460000 },
  { month: '3', line1: 390000, line2: 220000, line3: 9000 },
  { month: '4', line1: 760000, line2: 580000, line3: 160000 },
  { month: '5', line1: 490000, line2: 30000, line3: 40000 },
  { month: '6', line1: 490000, line2: 380000, line3: 90000 },
  { month: '7', line1: 960000, line2: 760000, line3: 340000 },
  { month: '8', line1: 320000, line2: 120000, line3: 30000 },
  { month: '9', line1: 760000, line2: 730000, line3: 480000 },
  { month: '10', line1: 660000, line2: 630000, line3: 480000 },
  { month: '11', line1: 750000, line2: 660000, line3: 320000 },
  { month: '12', line1: 700000, line2: 630000, line3: 240000 },
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

// Monochrome grayscale palette matching the design
const GREY_COLORS = [
  '#2C302E', '#434A47', '#59635F', '#707C77', 
  '#87958F', '#9EAFA7', '#B5C8BF', '#626868', 
  '#7A8181', '#939A9A', '#ACB3B3', '#C5CCCC'
];

export default function AccountingSection() {
  return (
    <div className="relative h-screen w-screen bg-[#EAE8FE] flex flex-col font-sans overflow-hidden select-none p-2 sm:p-4">
      
      {/* Main Container Wrapper */}
      <div className="relative flex-1 rounded-2xl overflow-hidden flex flex-col md:flex-row gap-2 sm:gap-3 min-h-0">
        
        {/* SIDEBAR NAVIGATION */}
        <div className="bg-[#EDEDED] rounded-2xl flex md:flex-col justify-between p-2 md:py-6 md:px-3 shrink-0 border border-white/60 shadow-xs md:w-16 items-center">
          <div className="flex md:flex-col items-center gap-4 w-full">
            <button className="p-2 text-gray-500 hover:bg-gray-200 rounded-xl transition-all">
              <ImageIcon className="w-5 h-5 text-gray-600" />
            </button>
            {/* Active Home Tab */}
            <button className="p-2 bg-[#C0C0C0] text-gray-800 rounded-xl shadow-xs">
              <Home className="w-5 h-5" />
            </button>
          </div>

          <div className="flex md:flex-col items-center gap-3 w-full">
            <button className="p-2 text-gray-500 hover:bg-gray-200 rounded-xl transition-all">
              <Settings className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MAIN PANEL */}
        <div className="flex-1 bg-[#EDEDED] rounded-2xl p-3 sm:p-5 flex flex-col gap-3 overflow-y-auto border border-white/60 shadow-xs min-h-0">
          
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
              <button className="p-1.5 text-gray-700 hover:bg-gray-300/60 rounded-full transition-all">
                <Bell className="w-4 h-4" />
              </button>
              <span className="text-xs font-black text-gray-800 hidden sm:inline">Hi, Acct!</span>
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center border border-gray-400/40">
                <ImageIcon className="w-4 h-4 text-gray-600" />
              </div>
            </div>
          </div>

          {/* MAIN CONTENT CONTAINER */}
          <div className="bg-[#F5F5F5] rounded-2xl p-4 sm:p-5 border border-gray-200/80 flex-1 flex flex-col gap-4 min-h-0 overflow-y-auto">
            
            <h2 className="text-sm sm:text-base font-black text-black tracking-wider uppercase shrink-0">
              ACCOUNTING SECTION
            </h2>

            {/* TOP ROW: DAILY & MONTHLY REVENUE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0">
              
              {/* CARD 1: DAILY REVENUE */}
              <div className="bg-[#E4E4E4] rounded-2xl p-3 border border-gray-300/60 flex flex-col items-center">
                <div className="bg-[#D8D8D8] text-gray-700 text-[10px] font-bold px-4 py-1 rounded-full border border-gray-400/40 uppercase mb-2">
                  DAILY REVENUE
                </div>

                <div className="w-full h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                      <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#555' }} />
                      <YAxis domain={[0, 50000]} ticks={[0, 10000, 20000, 30000, 40000, 50000]} tick={{ fontSize: 9, fill: '#555' }} />
                      <Tooltip />
                      <Line type="linear" dataKey="line1" stroke="#2D4A53" strokeWidth={1.5} dot={{ r: 3, fill: '#2D4A53' }} />
                      <Line type="linear" dataKey="line2" stroke="#8E5A5A" strokeWidth={1.5} dot={{ r: 3, fill: '#8E5A5A' }} />
                      <Line type="linear" dataKey="line3" stroke="#5B5282" strokeWidth={1.5} dot={{ r: 3, fill: '#5B5282' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* CARD 2: MONTHLY REVENUE */}
              <div className="bg-[#E4E4E4] rounded-2xl p-3 border border-gray-300/60 flex flex-col items-center">
                <div className="bg-[#D8D8D8] text-gray-700 text-[10px] font-bold px-4 py-1 rounded-full border border-gray-400/40 uppercase mb-2">
                  MONTHLY REVENUE
                </div>

                <div className="w-full h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                      <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#555' }} />
                      <YAxis domain={[0, 1000000]} ticks={[0, 200000, 400000, 600000, 800000, 1000000]} tick={{ fontSize: 9, fill: '#555' }} />
                      <Tooltip />
                      <Line type="linear" dataKey="line1" stroke="#2D4A53" strokeWidth={1.5} dot={{ r: 3, fill: '#2D4A53' }} />
                      <Line type="linear" dataKey="line2" stroke="#8E5A5A" strokeWidth={1.5} dot={{ r: 3, fill: '#8E5A5A' }} />
                      <Line type="linear" dataKey="line3" stroke="#2B2D42" strokeWidth={1.5} dot={{ r: 3, fill: '#2B2D42' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* BOTTOM ROW: INVENTORY BALANCE DONUT CHART */}
            <div className="flex justify-center w-full shrink-0">
              <div className="bg-[#E4E4E4] rounded-2xl p-4 border border-gray-300/60 flex flex-col items-center w-full max-w-xl">
                <div className="bg-[#D8D8D8] text-gray-700 text-[10px] font-bold px-4 py-1 rounded-full border border-gray-400/40 uppercase mb-2">
                  INVENTORY BALANCE
                </div>

                {/* DONUT CHART WITH CENTER NUMBER */}
                <div className="relative w-full h-[220px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={inventoryBalanceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={1}
                        dataKey="value"
                      >
                        {inventoryBalanceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={GREY_COLORS[index % GREY_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Center Total Count Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-xl font-black text-black">5668</span>
                  </div>
                </div>

                {/* LEGEND ROW */}
                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-2 text-[10px] text-gray-600 font-medium">
                  {inventoryBalanceData.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-1">
                      <span 
                        className="w-2 h-2 rounded-full inline-block" 
                        style={{ backgroundColor: GREY_COLORS[index % GREY_COLORS.length] }} 
                      />
                      <span>{item.name}</span>
                    </div>
                  ))}
                </div>

              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}