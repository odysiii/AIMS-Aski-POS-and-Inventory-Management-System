/**
 * Role → route landing page and role → allowed routes map.
 *
 * Mirrors the five stakeholder groups the July 10 consultation named:
 * Management/Supervisors, Tellers/Cashiers, Accounting, Inventory Team,
 * Consignment Partners. The Consignment portal has no screen yet — recorded
 * in BACKEND-HANDOFF.md.
 */

export const ROLES = {
  ADMIN: 'ADMIN',
  SUPERVISOR: 'SUPERVISOR',
  CASHIER: 'CASHIER',
  ACCOUNTING: 'ACCOUNTING',
  INVENTORY: 'INVENTORY',
};

/** Where a role lands right after logging in. */
export const LANDING_ROUTE = {
  ADMIN: '/admin-dashboard',
  SUPERVISOR: '/admin-dashboard',
  CASHIER: '/pos',
  ACCOUNTING: '/accounting',
  INVENTORY: '/inventory',
};

/** Roles that can supervise-approve a POS discount. */
export const SUPERVISOR_ROLES = [ROLES.ADMIN, ROLES.SUPERVISOR];

/** Convenience label for the sidebar / top bar. */
export const ROLE_LABEL = {
  ADMIN: 'Admin',
  SUPERVISOR: 'Supervisor',
  CASHIER: 'Cashier',
  ACCOUNTING: 'Accounting',
  INVENTORY: 'Inventory',
};
