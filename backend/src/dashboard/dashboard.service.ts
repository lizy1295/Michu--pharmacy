import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, In } from 'typeorm';
import { Product } from '../products/product.entity';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { User } from '../users/entities/user.entity';
import { Prescription, PrescriptionStatus } from '../prescriptions/entities/prescription.entity';

export interface DashboardStats {
  totalRevenue: number;
  todayOrders: number;
  totalProducts: number;
  totalCustomers: number;
  totalPrescriptions: number;
  pendingPrescriptions: number; // General clinic triage queue
  pendingOrders: number;
  outOfStock: number;
  monthlySales: number;
  productsSold: number;
  averageOrderValue: number;
}

export interface RevenueData {
  labels: string[];
  values: number[];
}

export interface OrderChartData {
  labels: string[];
  values: number[];
}

export interface RecentOrder {
  id: number;
  orderNumber: string;
  customer: string;
  total: number;
  status: string;
  date: string;
}

export interface RecentCustomer {
  id: number;
  name: string;
  email: string;
  orders: number;
  spent: number;
  joinedAt: string;
}

export interface TopProduct {
  id: number;
  name: string;
  brand: string;
  sold: number;
  revenue: number;
}

export interface Activity {
  id: number;
  action: string;
  description: string;
  user: string;
  timestamp: string;
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Prescription)
    private readonly prescriptionRepo: Repository<Prescription>,
  ) {}

  async getStats(): Promise<DashboardStats> {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    // Parallel optimized count queries
    const [
      totalProducts,
      totalCustomers,
      totalPrescriptions,
      pendingPrescriptions,
      pendingOrders,
      outOfStock,
      todayOrders,
      revenueResult,
      monthlyResult,
    ] = await Promise.all([
      this.productRepo.count(),
      this.userRepo.count({ where: { role: 'customer' } }),
      this.prescriptionRepo.count(),
      this.prescriptionRepo.count({ where: { status: PrescriptionStatus.PENDING } }),
      this.orderRepo.count({ where: { status: OrderStatus.PENDING } }),
      this.productRepo.count({ where: { stock: 0 } }),
      this.orderRepo.count({ where: { createdAt: MoreThanOrEqual(startOfToday) } }),
      this.orderRepo
        .createQueryBuilder('order')
        .select('SUM(order.total)', 'totalRevenue')
        .addSelect('AVG(order.total)', 'avgOrderValue')
        .addSelect('COUNT(order.id)', 'orderCount')
        .getRawOne(),
      this.orderRepo
        .createQueryBuilder('order')
        .select('SUM(order.total)', 'monthlySales')
        .where('order.createdAt >= :startOfMonth', { startOfMonth })
        .getRawOne(),
    ]);

    const totalRevenue = parseFloat(revenueResult?.totalRevenue ?? '0') || 0;
    const averageOrderValue = parseFloat(revenueResult?.avgOrderValue ?? '0') || 0;
    const monthlySales = parseFloat(monthlyResult?.monthlySales ?? '0') || 0;
    const productsSold = Math.round(totalRevenue > 0 ? totalRevenue / 150 : 0);

    return {
      totalRevenue: Number(totalRevenue.toFixed(2)),
      todayOrders,
      totalProducts,
      totalCustomers,
      totalPrescriptions,
      pendingPrescriptions,
      pendingOrders,
      outOfStock,
      monthlySales: Number(monthlySales.toFixed(2)),
      productsSold,
      averageOrderValue: Number(averageOrderValue.toFixed(2)),
    };
  }

  async getRevenue(period?: string): Promise<RevenueData> {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const values = new Array(12).fill(0);

    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);

    const yearOrders = await this.orderRepo
      .createQueryBuilder('order')
      .select('order.total', 'total')
      .addSelect('order.createdAt', 'createdAt')
      .where('order.createdAt >= :startOfYear', { startOfYear })
      .getRawMany();

    yearOrders.forEach((order) => {
      const date = new Date(order.createdAt);
      if (date.getFullYear() === currentYear) {
        values[date.getMonth()] += parseFloat(order.total || '0') || 0;
      }
    });

    return {
      labels: months,
      values: values.map((val) => Number(val.toFixed(2))),
    };
  }

  async getOrdersChart(): Promise<OrderChartData> {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const values = new Array(7).fill(0);

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentOrders = await this.orderRepo
      .createQueryBuilder('order')
      .select('order.createdAt', 'createdAt')
      .where('order.createdAt >= :sevenDaysAgo', { sevenDaysAgo })
      .getRawMany();

    recentOrders.forEach((order) => {
      const date = new Date(order.createdAt);
      values[date.getDay()] += 1;
    });

    return {
      labels: days,
      values,
    };
  }

  async getRecentOrders(limit = 10): Promise<RecentOrder[]> {
    const orders = await this.orderRepo.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });

    return orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customer: o.customerName,
      total: Number(o.total),
      status: o.status,
      date: o.createdAt ? new Date(o.createdAt).toISOString().split('T')[0] : '',
    }));
  }

  async getRecentCustomers(limit = 10): Promise<RecentCustomer[]> {
    const users = await this.userRepo.find({
      where: { role: 'customer' },
      order: { createdAt: 'DESC' },
      take: limit,
    });

    if (users.length === 0) return [];

    const userIds = users.map((u) => u.id);
    const orderAggregates = await this.orderRepo
      .createQueryBuilder('order')
      .select('order.customerId', 'customerId')
      .addSelect('COUNT(order.id)', 'orderCount')
      .addSelect('SUM(order.total)', 'totalSpent')
      .where('order.customerId IN (:...userIds)', { userIds })
      .groupBy('order.customerId')
      .getRawMany();

    const orderMap = new Map<number, { count: number; spent: number }>();
    orderAggregates.forEach((agg) => {
      orderMap.set(Number(agg.customerId), {
        count: parseInt(agg.orderCount, 10) || 0,
        spent: parseFloat(agg.totalSpent) || 0,
      });
    });

    return users.map((u) => {
      const agg = orderMap.get(u.id) || { count: 0, spent: 0 };
      return {
        id: u.id,
        name: `${u.firstName} ${u.lastName}`.trim(),
        email: u.email ?? '',
        orders: agg.count,
        spent: Number(agg.spent.toFixed(2)),
        joinedAt: u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : '',
      };
    });
  }

  async getTopProducts(limit = 10): Promise<TopProduct[]> {
    const products = await this.productRepo.find({
      order: { stock: 'ASC' },
      take: limit,
    });

    return products.map((p) => ({
      id: p.id,
      name: p.name,
      brand: p.brand || 'N/A',
      sold: p.stock > 0 ? 100 - Math.min(p.stock, 100) : 100,
      revenue: Number((Number(p.price) * (100 - Math.min(p.stock, 100))).toFixed(2)),
    }));
  }

  async getActivities(limit = 20): Promise<Activity[]> {
    const recentOrders = await this.orderRepo.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });

    return recentOrders.map((o) => ({
      id: o.id,
      action: 'order_created',
      description: `Order ${o.orderNumber} placed by ${o.customerName}`,
      user: o.customerName,
      timestamp: o.createdAt ? new Date(o.createdAt).toISOString() : new Date().toISOString(),
    }));
  }
}
