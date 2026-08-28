import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    try {
      // 1. Try admins auth endpoint
      const backendRes = await fetch(`${BACKEND_API_URL}/admins/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (backendRes.ok) {
        const data = await backendRes.json();
        return NextResponse.json(data);
      }

      // 2. Try general auth login endpoint
      const authRes = await fetch(`${BACKEND_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (authRes.ok) {
        const authData = await authRes.json();
        return NextResponse.json({
          accessToken: authData.tokens.accessToken,
          refreshToken: authData.tokens.refreshToken,
          admin: {
            id: authData.user.id,
            email: authData.user.email,
            name: `${authData.user.firstName || ''} ${authData.user.lastName || ''}`.trim() || 'Admin User',
            role: authData.user.role,
            phone: authData.user.phone || '',
            lastLogin: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          },
        });
      }

      const errorData = await backendRes.json().catch(() => ({}));
      return NextResponse.json(
        { message: errorData.message || 'Invalid email or password' },
        { status: backendRes.status || 401 }
      );
    } catch (backendError: any) {
      return NextResponse.json(
        { message: `Backend service is unreachable. Please ensure the backend is running. (${backendError.message})` },
        { status: 503 }
      );
    }
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Login failed' }, { status: 500 });
  }
}

