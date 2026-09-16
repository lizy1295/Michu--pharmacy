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
      // Admin page strictly authenticates against the admins endpoint ONLY
      const backendRes = await fetch(`${BACKEND_API_URL}/admins/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (backendRes.ok) {
        const data = await backendRes.json();
        return NextResponse.json(data);
      }

      const errorData = await backendRes.json().catch(() => ({}));
      return NextResponse.json(
        { message: errorData.message || 'Invalid admin credentials' },
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
