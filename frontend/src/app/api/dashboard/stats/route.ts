import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    totalRevenue: 1250000,
    todayOrders: 48,
    totalProducts: 156,
    totalCustomers: 892,
    totalPrescriptions: 234,
    pendingOrders: 12,
    outOfStock: 8,
    monthlySales: 450000,
  });
}
