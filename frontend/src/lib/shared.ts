/**
 * Local re-export of all shared types and utilities.
 *
 * Turbopack (Next.js 15 dev mode) cannot resolve `file:` workspace package
 * references even with `transpilePackages`. This file inlines everything from
 * `@michu/shared` so imports work without the broken package alias.
 */

// ── Roles ─────────────────────────────────────────────────────────────────

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

export function normalizeRole(role: string | null | undefined): string {
  if (!role) return '';
  return role.toLowerCase().replace(/[\s_-]+/g, '');
}

export function isStaffRole(role: string | null | undefined): boolean {
  if (!role) return false;
  const normalized = normalizeRole(role);
  return STAFF_ROLES.some((r) => normalizeRole(r) === normalized);
}

export function hasRole(
  userRole: string | null | undefined,
  allowedRoles: (UserRole | string)[],
): boolean {
  if (!userRole) return false;
  const normalizedUserRole = normalizeRole(userRole);
  if (normalizedUserRole === 'superadmin') return true;
  if (normalizedUserRole === 'admin') {
    const isSuperAdminOnly =
      allowedRoles.length === 1 && normalizeRole(allowedRoles[0]) === 'superadmin';
    if (!isSuperAdminOnly) return true;
  }
  if (normalizedUserRole === 'staff') {
    const isSuperAdminOnly =
      allowedRoles.length === 1 && normalizeRole(allowedRoles[0]) === 'superadmin';
    if (!isSuperAdminOnly) return true;
  }
  return allowedRoles.some((allowed) => normalizeRole(allowed) === normalizedUserRole);
}

// ── Auth Types ─────────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  email?: string | null;
  firstName: string;
  lastName: string;
  role: UserRole;
  branchId: string | null;
  phone?: string | null;
  profileImage?: string | null;
}

export interface LoginRequest {
  email?: string;
  phone?: string;
  password: string;
}

export interface RegisterRequest {
  email?: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// ── User Types ─────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: UserRole;
  branchId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
