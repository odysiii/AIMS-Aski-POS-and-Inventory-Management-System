import { useState } from 'react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { currentData, futureData } from '../../mocks/demandForecast';

export default function DemandForecast() {
  const [activeTab, setActiveTab] = useState('Future');
  const activeData = activeTab === 'Current' ? currentData : futureData;

  return (
    <div className="bg-[#F5F5F5] rounded-2xl p-4 sm:p-5 border border-gray-200/80 flex-1 flex flex-col min-h-0">
      {/* Title and tabs */}
      <div className="shrink-0 mb-4 border-b border-gray-300/80 pb-1">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-black text-black tracking-wider uppercase mb-2">
            Demand
          </h2>
          <span
            className="text-[10px] font-bold uppercase tracking-wide text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded"
            title="Forecast preview — Python model pending. See BACKEND-HANDOFF.md item #7."
          >
            Forecast preview — model pending
          </span>
        </div>

        <div
          role="tablist"
          aria-label="Forecast horizon"
          className="flex justify-center items-center gap-12 sm:gap-20 text-xs sm:text-sm font-bold"
        >
          {['Current', 'Future'].map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={`relative pb-2 transition-all cursor-pointer ${
                activeTab === tab ? 'text-black font-black' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gray-500 rounded-full"
                  aria-hidden="true"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chart grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0 overflow-y-auto pr-1">
        <ForecastCard title="Transaction Hours">
          <BarChart data={activeData.transactionHours} margin={{ top: 10, right: 10, left: -25, bottom: 15 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ccc" />
            <XAxis
              dataKey="hour"
              tick={{ fontSize: 10, fill: '#374151' }}
              label={{ value: 'HOUR OF DAY (8 AM - 6 PM)', position: 'insideBottom', offset: -10, fontSize: 9, fill: '#374151', fontWeight: 'bold' }}
            />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#374151' }} />
            <Tooltip />
            <Bar dataKey="dark" fill="#525252" radius={[2, 2, 0, 0]} />
            <Bar dataKey="light" fill="#9CA3AF" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ForecastCard>

        <ForecastCard title="Revenue Trend">
          <AreaChart data={activeData.revenueTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#374151' }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#374151' }} />
            <Tooltip />
            <Area type="linear" dataKey="line1" stroke="#374151" fill="#4B5563" fillOpacity={0.3} dot={{ r: 2 }} />
            <Area type="linear" dataKey="line2" stroke="#6B7280" fill="#9CA3AF" fillOpacity={0.3} dot={{ r: 2 }} />
            <Area type="linear" dataKey="line3" stroke="#9CA3AF" fill="#D1D5DB" fillOpacity={0.2} dot={{ r: 2 }} />
          </AreaChart>
        </ForecastCard>

        <ForecastCard title="Category Sales">
          <BarChart data={activeData.categorySales} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ccc" />
            <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#374151' }} />
            <YAxis domain={[0, 900]} tick={{ fontSize: 10, fill: '#374151' }} />
            <Tooltip />
            <Bar dataKey="sales" fill="#6B7280" barSize={35} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ForecastCard>

        <ForecastCard title="Top Specific Items">
          <BarChart data={activeData.topSpecificItems} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ccc" />
            <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#374151' }} />
            <YAxis domain={[0, 2000]} tick={{ fontSize: 10, fill: '#374151' }} />
            <Tooltip />
            <Bar dataKey="seg3" stackId="a" fill="#2D4A53" barSize={35} />
            <Bar dataKey="seg2" stackId="a" fill="#8E9399" />
            <Bar dataKey="seg1" stackId="a" fill="#B3B7BC" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ForecastCard>
      </div>
    </div>
  );
}

function ForecastCard({ title, children }) {
  return (
    <div className="bg-[#E4E4E4] rounded-2xl p-3 border border-gray-300/60 flex flex-col items-center">
      <div className="bg-[#D8D8D8] text-gray-800 text-[10px] font-bold px-4 py-1 rounded-full border border-gray-400/40 uppercase mb-2">
        {title}
      </div>
      <div className="w-full flex-1 min-h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
