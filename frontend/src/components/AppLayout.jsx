import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Bell, Image as ImageIcon } from 'lucide-react';
import Sidebar from './Sidebar';
import ErrorBoundary from './ErrorBoundary';
import { useAuth } from '../auth/useAuth';
import { ROLE_LABEL } from '../auth/roles';

/** Path segment → breadcrumb label. */
const CRUMB_LABEL = {
  'admin-dashboard': 'HOME',
  inventory: 'INVENTORY',
  demand: 'FORECAST',
  accounting: 'ANALYTICS',
  pos: 'POS',
};

function buildBreadcrumb(pathname, role) {
  const segments = pathname.split('/').filter(Boolean);
  const tail = segments.map((s) => CRUMB_LABEL[s] || s.toUpperCase()).join(' - ');
  const roleLabel = role ? ROLE_LABEL[role]?.toUpperCase() || role : 'GUEST';
  return `AIMS - IM - ${roleLabel} - ${tail || 'HOME'}`;
}

export default function AppLayout() {
  const [expanded, setExpanded] = useState(false);
  const { pathname } = useLocation();
  const { user, role } = useAuth();

  return (
    <div className="relative flex h-full w-full flex-col font-sans">
      {/* Breadcrumb */}
      <div className="pt-2 pl-3 sm:pl-4 text-gray-600 font-semibold text-[10px] sm:text-xs tracking-wider uppercase z-20 shrink-0">
        {buildBreadcrumb(pathname, role)}
      </div>

      <div className="relative flex-1 m-2 sm:m-3 md:m-4 mt-1 rounded-2xl overflow-hidden flex flex-col md:flex-row gap-2 sm:gap-3 min-h-0">
        <Sidebar expanded={expanded} onToggle={() => setExpanded((v) => !v)} />

        {/* Main pane */}
        <div className="flex-1 bg-[#EDEDED] rounded-2xl p-3 sm:p-4 flex flex-col gap-3 overflow-y-auto border border-white/60 shadow-sm min-h-0">
          {/* Top bar */}
          <div className="flex items-center justify-between shrink-0 mb-1 gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gray-300 flex items-center justify-center border border-gray-400/40 shrink-0">
                <ImageIcon className="w-4 h-4 text-gray-700" aria-hidden="true" />
              </div>
              <h1 className="text-xs sm:text-sm md:text-base font-black text-black tracking-wide uppercase truncate">
                INVENTORY MANAGEMENT
              </h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                type="button"
                className="p-1.5 sm:p-2 text-gray-700 hover:bg-gray-300/60 rounded-full transition-all cursor-pointer"
                aria-label="Notifications"
                title="Notifications"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <span className="text-[11px] sm:text-xs font-black text-gray-800 hidden sm:inline">
                Hi, {user?.username || 'Guest'}!
              </span>
              <div
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-300 flex items-center justify-center border border-gray-400/40 shrink-0"
                aria-hidden="true"
              >
                <ImageIcon className="w-4 h-4 text-gray-700" />
              </div>
            </div>
          </div>

          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
