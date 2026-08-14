import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

/**
 * Route guard. Two usage patterns:
 *
 *   As an Outlet wrapper:
 *     <Route element={<RequireAuth />}>…</Route>
 *     <Route element={<RequireAuth roles={['ADMIN']} />}>…</Route>
 *
 *   As an inline child wrapper for a single route element:
 *     <Route path="/x" element={<RequireAuth roles={['ADMIN']}><X /></RequireAuth>} />
 */
export default function RequireAuth({ roles, children }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="flex h-full w-full items-center justify-center p-6">
        <div className="max-w-md rounded-2xl bg-white p-6 text-center shadow-lg">
          <h1 className="text-lg font-black text-gray-900">Access restricted</h1>
          <p className="mt-2 text-sm text-gray-600">
            Your role ({user.role}) is not permitted to view this screen. Contact your
            supervisor if you believe this is an error.
          </p>
        </div>
      </div>
    );
  }

  return children ?? <Outlet />;
}
