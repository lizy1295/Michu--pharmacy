export enum UserRole {
  SUPERADMIN = 'superadmin',
  BRANCH_ADMIN = 'branch_admin',
  PHARMACIST = 'pharmacist',
  CASHIER = 'cashier',
  WORKER = 'worker',
  CUSTOMER = 'customer',
}

export const STAFF_ROLES: UserRole[] = [
  UserRole.SUPERADMIN,
  UserRole.BRANCH_ADMIN,
  UserRole.PHARMACIST,
  UserRole.CASHIER,
  UserRole.WORKER,
];
