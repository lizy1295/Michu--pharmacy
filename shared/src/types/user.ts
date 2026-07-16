import { UserRole } from '../constants/roles';

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
