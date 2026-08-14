import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Package,
  TrendingUp,
  BarChart2,
  Settings,
  LogOut,
  Menu,
  Store,
} from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { ROLES } from '../auth/roles';

const NAV_ITEMS = [
  { to: '/admin-dashboard', label: 'Home',      icon: Home,       roles: [ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.ACCOUNTING, ROLES.INVENTORY] },
  { to: '/inventory',       label: 'Inventory', icon: Package,    roles: [ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.INVENTORY] },
  { to: '/demand',          label: 'Forecast',  icon: TrendingUp, roles: [ROLES.ADMIN, ROLES.SUPERVISOR] },
  { to: '/accounting',      label: 'Analytics', icon: BarChart2,  roles: [ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.ACCOUNTING] },
  { to: '/pos',             label: 'POS',       icon: Store,      roles: [ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.CASHIER] },
];

export default function Sidebar({ expanded, onToggle }) {
  const { role, logout } = useAuth();
  const navigate = useNavigate();

  const visible = NAV_ITEMS.filter((item) => !role || item.roles.includes(role));

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const itemClass = ({ isActive }) =>
    [
      'p-2 rounded-xl transition-all flex items-center shrink-0',
      expanded ? 'w-full justify-start gap-3 px-3' : 'justify-center',
      isActive
        ? 'bg-[#C0C0C0] text-gray-900 shadow-sm'
        : 'text-gray-600 hover:text-black hover:bg-gray-200',
    ].join(' ');

  return (
    <nav
      aria-label="Primary"
      className={`bg-[#EDEDED] rounded-2xl flex md:flex-col justify-between p-2 md:py-4 shrink-0 shadow-sm border border-white/60 transition-all duration-300 ease-in-out ${
        expanded ? 'md:w-48 md:px-3' : 'md:w-16 items-center'
      }`}
    >
      {/* Top group */}
      <div className="flex md:flex-col items-center gap-2 md:gap-3 w-full">
        <button
          type="button"
          onClick={onToggle}
          aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
          title={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
          className={`p-2 text-gray-600 hover:text-black hover:bg-gray-200 rounded-xl transition-all flex items-center cursor-pointer ${
            expanded ? 'w-full justify-start gap-3 px-2.5' : 'justify-center'
          }`}
        >
          <Menu className="w-5 h-5 shrink-0" aria-hidden="true" />
          {expanded && <span className="hidden md:inline text-xs font-bold text-gray-700">Collapse</span>}
        </button>

        {visible.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={itemClass}
            aria-label={item.label}
            title={item.label}
          >
            <item.icon className="w-5 h-5 shrink-0" aria-hidden="true" />
            {expanded && (
              <span className="hidden md:inline text-xs font-bold whitespace-nowrap">
                {item.label}
              </span>
            )}
          </NavLink>
        ))}
      </div>

      {/* Bottom group */}
      <div className="flex md:flex-col items-center gap-2 w-full justify-end">
        <button
          type="button"
          aria-label="Settings"
          title="Settings"
          className={`p-2 text-gray-500 hover:text-black hover:bg-gray-200 rounded-xl transition-all flex items-center cursor-pointer ${
            expanded ? 'w-full justify-start gap-3 px-3' : 'justify-center'
          }`}
        >
          <Settings className="w-5 h-5 shrink-0" aria-hidden="true" />
          {expanded && <span className="hidden md:inline text-xs font-bold text-gray-700 whitespace-nowrap">Settings</span>}
        </button>

        <button
          type="button"
          onClick={handleLogout}
          aria-label="Log out"
          title="Log out"
          className={`p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all flex items-center cursor-pointer ${
            expanded ? 'w-full justify-start gap-3 px-3' : 'justify-center'
          }`}
        >
          <LogOut className="w-5 h-5 shrink-0" aria-hidden="true" />
          {expanded && <span className="hidden md:inline text-xs font-bold text-red-600 whitespace-nowrap">Logout</span>}
        </button>
      </div>
    </nav>
  );
}
