"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STAFF_ROLES = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["SUPERADMIN"] = "superadmin";
    UserRole["BRANCH_ADMIN"] = "branch_admin";
    UserRole["PHARMACIST"] = "pharmacist";
    UserRole["CASHIER"] = "cashier";
    UserRole["WORKER"] = "worker";
    UserRole["CUSTOMER"] = "customer";
})(UserRole || (exports.UserRole = UserRole = {}));
exports.STAFF_ROLES = [
    UserRole.SUPERADMIN,
    UserRole.BRANCH_ADMIN,
    UserRole.PHARMACIST,
    UserRole.CASHIER,
    UserRole.WORKER,
];
//# sourceMappingURL=roles.js.map