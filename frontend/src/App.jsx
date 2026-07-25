import { Routes, Route, Link, useLocation } from 'react-router-dom'
import CashierPOS from './pages/CashierPOS'

// Simple placeholder page for testing navigation
function Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Manager Dashboard</h1>
    </div>
  )
}

export default function App() {
  const location = useLocation();

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-100">
      {/* Route Views (Fills remaining height) */}
      <main className="flex-1 min-h-0 overflow-y-auto">
        <Routes>
          <Route path="/" element={<CashierPOS />} />
          <Route path="/pos" element={<CashierPOS />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  )
}