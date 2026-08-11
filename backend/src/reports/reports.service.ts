import { Injectable } from '@nestjs/common';

export interface RevenueReport {
  period: string;
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: { name: string; revenue: number }[];
}

export interface OrdersReport {
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  pendingOrders: number;
  ordersByStatus: { status: string; count: number }[];
}

export interface ProductsReport {
  totalProducts: number;
  outOfStock: number;
  lowStock: number;
  topSelling: { name: string; sold: number }[];
}

export interface CustomersReport {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  topCustomers: { name: string; orders: number; spent: number }[];
}

@Injectable()
export class ReportsService {
  async getRevenueReport(startDate?: string, endDate?: string): Promise<RevenueReport> {
    return {
      period: `${startDate || '2026-01-01'} to ${endDate || '2026-12-31'}`,
      totalRevenue: 1250000,
      totalOrders: 1248,
      averageOrderValue: 1001,
      topProducts: [
        { name: 'Panadol 500mg', revenue: 45000 },
        { name: 'Metformin 850mg', revenue: 38000 },
        { name: 'Amoxicillin 500mg', revenue: 32000 },
      ],
    };
  }

  async getOrdersReport(): Promise<OrdersReport> {
    return {
      totalOrders: 1248,
      completedOrders: 980,
      cancelledOrders: 45,
      pendingOrders: 223,
      ordersByStatus: [
        { status: 'completed', count: 980 },
        { status: 'pending', count: 223 },
        { status: 'cancelled', count: 45 },
      ],
    };
  }

  async getProductsReport(): Promise<ProductsReport> {
    return {
      totalProducts: 156,
      outOfStock: 8,
      lowStock: 12,
      topSelling: [
        { name: 'Panadol 500mg', sold: 1200 },
        { name: 'Metformin 850mg', sold: 950 },
        { name: 'Amoxicillin 500mg', sold: 800 },
      ],
    };
  }

  async getCustomersReport(): Promise<CustomersReport> {
    return {
      totalCustomers: 892,
      newCustomers: 145,
      returningCustomers: 747,
      topCustomers: [
        { name: 'Abebe Kebede', orders: 12, spent: 15600 },
        { name: 'Sara Tesfaye', orders: 8, spent: 9200 },
        { name: 'Marta Alemu', orders: 15, spent: 18500 },
      ],
    };
  }

  async getInventoryReport(): Promise<any> {
    return {
      totalStock: 15420,
      lowStockItems: 8,
      expiredItems: 3,
      warehouseValue: 2450000,
    };
  }

  async exportCsv(type: string): Promise<{ url: string }> {
    return { url: `/reports/export/${type}-${Date.now()}.csv` };
  }

  async exportPdf(type: string): Promise<{ url: string }> {
    return { url: `/reports/export/${type}-${Date.now()}.pdf` };
  }
}
