import { Routes, Route, Navigate } from 'react-router-dom';
import CashierPOS from './pages/cashierPOS';
import LogIn from './pages/auth/login';
import AdminDashboard from './pages/ims/adminDashboard';
import InventoryList from './pages/ims/inventoryList';
import Demand from './pages/ims/demand';
import Accounting from './pages/ims/accounting';
import NotFound from './pages/NotFound';
import AppLayout from './components/AppLayout';
import RequireAuth from './auth/RequireAuth';
import { ROLES } from './auth/roles';

export default function App() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-100">
      <main className="flex-1 min-h-0 overflow-y-auto">
        <Routes>
          {/* Public */}
          <Route path="/" element={<LogIn />} />

          {/* POS keeps its own full-bleed layout (different chrome) */}
          <Route element={<RequireAuth roles={[ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.CASHIER]} />}>
            <Route path="/pos" element={<CashierPOS />} />
          </Route>

          {/* IMS screens share the sidebar + top bar */}
          <Route element={<RequireAuth />}>
            <Route element={<AppLayout />}>
              <Route
                path="/admin-dashboard"
                element={<AdminDashboard />}
              />
              <Route
                path="/inventory"
                element={
                  <RequireAuth roles={[ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.INVENTORY]}>
                    <InventoryList />
                  </RequireAuth>
                }
              />
              <Route
                path="/demand"
                element={
                  <RequireAuth roles={[ROLES.ADMIN, ROLES.SUPERVISOR]}>
                    <Demand />
                  </RequireAuth>
                }
              />
              <Route
                path="/accounting"
                element={
                  <RequireAuth
                    roles={[ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.ACCOUNTING]}
                  >
                    <Accounting />
                  </RequireAuth>
                }
              />

              {/* Legacy camelCase paths — keep old bookmarks/QR codes working. */}
              <Route path="/adminDashboard" element={<Navigate to="/admin-dashboard" replace />} />
              <Route path="/inventoryList" element={<Navigate to="/inventory" replace />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}
