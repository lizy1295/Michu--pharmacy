export enum UserRole {
  SUPERADMIN = 'superadmin',
  ADMIN = 'admin',
  STAFF = 'staff',
  BRANCH_ADMIN = 'branch_admin',
  PHARMACIST = 'pharmacist',
  DOCTOR = 'doctor',
  CASHIER = 'cashier',
  WORKER = 'worker',
  CUSTOMER = 'customer',
}

export const STAFF_ROLES: UserRole[] = [
  UserRole.SUPERADMIN,
  UserRole.ADMIN,
  UserRole.STAFF,
  UserRole.BRANCH_ADMIN,
  UserRole.PHARMACIST,
  UserRole.DOCTOR,
  UserRole.CASHIER,
  UserRole.WORKER,
];

/**
 * Normalizes any role string into a canonical lowercase format without spaces or underscores
 * e.g. "Super Admin" -> "superadmin", "super_admin" -> "superadmin", "Pharmacist" -> "pharmacist"
 */
export function normalizeRole(role: string | null | undefined): string {
  if (!role) return '';
  return role.toLowerCase().replace(/[\s_-]+/g, '');
}

/**
 * Checks if a given role is any staff/admin role
 */
export function isStaffRole(role: string | null | undefined): boolean {
  if (!role) return false;
  const normalized = normalizeRole(role);
  return STAFF_ROLES.some((r) => normalizeRole(r) === normalized);
}

/**
 * Checks if a user's role matches any of the allowed roles
 * Superadmin and admin have implicit access to any staff-level permission
 */
export function hasRole(
  userRole: string | null | undefined,
  allowedRoles: (UserRole | string)[],
): boolean {
  if (!userRole) return false;
  const normalizedUserRole = normalizeRole(userRole);

  // Superadmin always has all permissions
  if (normalizedUserRole === 'superadmin') {
    return true;
  }

  // Admin has access if staff roles or admin is allowed
  if (normalizedUserRole === 'admin') {
    const isSuperAdminOnly =
      allowedRoles.length === 1 && normalizeRole(allowedRoles[0]) === 'superadmin';
    if (!isSuperAdminOnly) {
      return true;
    }
  }

  // Staff (legacy admin-table role) has access to any staff-level endpoint
  if (normalizedUserRole === 'staff') {
    const isSuperAdminOnly =
      allowedRoles.length === 1 && normalizeRole(allowedRoles[0]) === 'superadmin';
    if (!isSuperAdminOnly) {
      return true;
    }
  }

  return allowedRoles.some((allowed) => normalizeRole(allowed) === normalizedUserRole);
}
