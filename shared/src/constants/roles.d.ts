export declare enum UserRole {
    SUPERADMIN = "superadmin",
    ADMIN = "admin",
    STAFF = "staff",
    BRANCH_ADMIN = "branch_admin",
    PHARMACIST = "pharmacist",
    DOCTOR = "doctor",
    CASHIER = "cashier",
    WORKER = "worker",
    CUSTOMER = "customer"
}
export declare const STAFF_ROLES: UserRole[];
export declare function normalizeRole(role: string | null | undefined): string;
export declare function isStaffRole(role: string | null | undefined): boolean;
export declare function hasRole(userRole: string | null | undefined, allowedRoles: (UserRole | string)[]): boolean;
