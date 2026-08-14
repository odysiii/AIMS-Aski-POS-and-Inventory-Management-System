import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { apiPost, AUTH_MODE, ApiError } from '../lib/api';
import { DEV_USERS, DEV_SUPERVISOR_PIN } from './devUsers';
import { SUPERVISOR_ROLES } from './roles';

const STORAGE_KEY = 'aims.auth';

// Exported so useAuth (in a sibling file) can consume it. The provider stays
// in its own file so React Fast Refresh treats this module as component-only.
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStoredUser(user) {
  try {
    if (user) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage may be disabled — non-fatal */
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);

  useEffect(() => {
    writeStoredUser(user);
  }, [user]);

  const login = useCallback(async (username, password) => {
    const trimmed = (username || '').trim();
    if (!trimmed || !password) {
      throw new Error('Username and password are required.');
    }

    if (AUTH_MODE === 'api') {
      // Contract for the backend team: POST /api/auth/login returns { id, username, role }.
      const response = await apiPost('/api/auth/login', {
        username: trimmed,
        password,
      });
      const authed = {
        id: response.id,
        username: response.username,
        role: response.role,
      };
      setUser(authed);
      return authed;
    }

    // Dev fallback — matches the seeded role table.
    const match = DEV_USERS.find(
      (u) => u.username.toLowerCase() === trimmed.toLowerCase() && u.password === password
    );
    if (!match) throw new Error('Invalid username or password.');
    const authed = { id: match.id, username: match.username, role: match.role };
    setUser(authed);
    return authed;
  }, []);

  const logout = useCallback(() => setUser(null), []);

  /**
   * Authorize a POS supervisor discount. In api mode this eventually hits a
   * dedicated endpoint; today we short-circuit against the dev PIN so the
   * feature works. Returns true on success.
   */
  const authorizeSupervisor = useCallback(async (pin) => {
    if (AUTH_MODE === 'api') {
      try {
        await apiPost('/api/auth/authorize-supervisor', { pin });
        return true;
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          // Endpoint not implemented yet — fall through to dev check.
        } else {
          return false;
        }
      }
    }
    return pin === DEV_SUPERVISOR_PIN;
  }, []);

  const value = useMemo(
    () => ({
      user,
      role: user?.role || null,
      isAuthenticated: !!user,
      isSupervisor: user ? SUPERVISOR_ROLES.includes(user.role) : false,
      login,
      logout,
      authorizeSupervisor,
    }),
    [user, login, logout, authorizeSupervisor]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
