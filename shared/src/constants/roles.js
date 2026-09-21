"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STAFF_ROLES = exports.UserRole = void 0;
exports.normalizeRole = normalizeRole;
exports.isStaffRole = isStaffRole;
exports.hasRole = hasRole;
var UserRole;
(function (UserRole) {
    UserRole["SUPERADMIN"] = "superadmin";
    UserRole["ADMIN"] = "admin";
    UserRole["STAFF"] = "staff";
    UserRole["BRANCH_ADMIN"] = "branch_admin";
    UserRole["PHARMACIST"] = "pharmacist";
    UserRole["DOCTOR"] = "doctor";
    UserRole["CASHIER"] = "cashier";
    UserRole["WORKER"] = "worker";
    UserRole["CUSTOMER"] = "customer";
})(UserRole || (exports.UserRole = UserRole = {}));
exports.STAFF_ROLES = [
    UserRole.SUPERADMIN,
    UserRole.ADMIN,
    UserRole.STAFF,
    UserRole.BRANCH_ADMIN,
    UserRole.PHARMACIST,
    UserRole.DOCTOR,
    UserRole.CASHIER,
    UserRole.WORKER,
];
function normalizeRole(role) {
    if (!role)
        return '';
    return role.toLowerCase().replace(/[\s_-]+/g, '');
}
function isStaffRole(role) {
    if (!role)
        return false;
    const normalized = normalizeRole(role);
    return exports.STAFF_ROLES.some((r) => normalizeRole(r) === normalized);
}
function hasRole(userRole, allowedRoles) {
    if (!userRole)
        return false;
    const normalizedUserRole = normalizeRole(userRole);
    if (normalizedUserRole === 'superadmin') {
        return true;
    }
    if (normalizedUserRole === 'admin') {
        const isSuperAdminOnly = allowedRoles.length === 1 && normalizeRole(allowedRoles[0]) === 'superadmin';
        if (!isSuperAdminOnly) {
            return true;
        }
    }
    if (normalizedUserRole === 'staff') {
        const isSuperAdminOnly = allowedRoles.length === 1 && normalizeRole(allowedRoles[0]) === 'superadmin';
        if (!isSuperAdminOnly) {
            return true;
        }
    }
    return allowedRoles.some((allowed) => normalizeRole(allowed) === normalizedUserRole);
}
//# sourceMappingURL=roles.js.map