import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import CashierPOS from './pages/cashierPOS'
import LogIn from './pages/auth/login'
import AdminDashboard  from './pages/ims/adminDashboard'
import InventoryList  from './pages/ims/inventoryList'
import Demand  from './pages/ims/demand'
import Analytics  from './pages/ims/analytics'
import Accounting  from './pages/ims/accounting'
import POS from './pages/pos'


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
          <Route path="/" element={<LogIn />} />
          <Route path="/cashierPOS" element={<CashierPOS />} />
          <Route path="/adminDashboard" element={<AdminDashboard />} />
          <Route path="/inventoryList" element={<InventoryList />} />
          <Route path="/demand" element={<Demand />} />
          <Route path="/analytics" element={<Analytics />} /> 
          <Route path="/accounting" element={<Accounting />} />          
          <Route path="/pos" element={<POS />} />
        </Routes>
      </main>
    </div>
  )
}