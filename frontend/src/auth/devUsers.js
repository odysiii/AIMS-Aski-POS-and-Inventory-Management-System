/**
 * Dev-mode role table used when VITE_AUTH_MODE=dev.
 *
 * This exists purely so the app is demoable today without POST /api/auth/login.
 * The moment the backend implements that route, set VITE_AUTH_MODE=api and this
 * file stops being read. It must never ship to production.
 */

export const DEV_USERS = [
  { id: 1, username: 'admin',      password: 'admin123',      role: 'ADMIN' },
  { id: 2, username: 'supervisor', password: 'supervisor123', role: 'SUPERVISOR' },
  { id: 3, username: 'cashier',    password: 'cashier123',    role: 'CASHIER' },
  { id: 4, username: 'accounting', password: 'accounting123', role: 'ACCOUNTING' },
  { id: 5, username: 'inventory',  password: 'inventory123',  role: 'INVENTORY' },
];

/** Password that supervisors punch in at the POS to authorize a discount. */
export const DEV_SUPERVISOR_PIN = 'super123';
