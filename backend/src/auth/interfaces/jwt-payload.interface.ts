import { UserRole } from '@michu/shared';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  branchId: string | null;
  type: 'access' | 'refresh';
}
