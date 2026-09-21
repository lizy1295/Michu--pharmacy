import { UserRole } from '../constants/roles';
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
