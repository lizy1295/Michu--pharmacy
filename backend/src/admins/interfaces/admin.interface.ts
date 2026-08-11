export interface Admin {
  id: number;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'manager' | 'staff';
  avatar?: string;
  phone?: string;
  lastLogin?: string;
  createdAt: string;
}

export interface AdminLoginDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AdminAuthResponse {
  accessToken: string;
  refreshToken: string;
  admin: Admin;
}
