import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Product } from '../products/product.entity';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { User } from '../users/entities/user.entity';
import { Prescription } from '../prescriptions/entities/prescription.entity';

export interface DashboardStats {
  totalRevenue: number;
  todayOrders: number;
  totalProducts: number;
  totalCustomers: number;
  totalPrescriptions: number;
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
    const totalProducts = await this.productRepo.count();
    const totalCustomers = await this.userRepo.count({ where: { role: 'customer' } });
    const totalPrescriptions = await this.prescriptionRepo.count();
    const pendingOrders = await this.orderRepo.count({ where: { status: OrderStatus.PENDING } });
    const outOfStock = await this.productRepo.count({ where: { stock: 0 } });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayOrders = await this.orderRepo.count({
      where: { createdAt: MoreThanOrEqual(startOfToday) },
    });

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const monthlyOrders = await this.orderRepo.find({
      where: { createdAt: MoreThanOrEqual(startOfMonth) },
    });
    const monthlySales = monthlyOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);

    const allOrders = await this.orderRepo.find();
    const totalRevenue = allOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const averageOrderValue = allOrders.length > 0 ? totalRevenue / allOrders.length : 0;

    let productsSold = 0;
    allOrders.forEach((o) => {
      if (Array.isArray(o.items)) {
        o.items.forEach((item: any) => {
          productsSold += Number(item.quantity || 1);
        });
      }
    });

    return {
      totalRevenue: Number(totalRevenue.toFixed(2)),
      todayOrders,
      totalProducts,
      totalCustomers,
      totalPrescriptions,
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

    const orders = await this.orderRepo.find();
    const currentYear = new Date().getFullYear();

    orders.forEach((order) => {
      const date = new Date(order.createdAt);
      if (date.getFullYear() === currentYear) {
        values[date.getMonth()] += Number(order.total || 0);
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

    const orders = await this.orderRepo.find();
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    orders.forEach((order) => {
      const date = new Date(order.createdAt);
      if (date >= sevenDaysAgo) {
        values[date.getDay()] += 1;
      }
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

    const results: RecentCustomer[] = [];
    for (const u of users) {
      const userOrders = await this.orderRepo.find({ where: { customerId: u.id } });
      const spent = userOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
      results.push({
        id: u.id,
        name: `${u.firstName} ${u.lastName}`.trim(),
        email: u.email,
        orders: userOrders.length,
        spent: Number(spent.toFixed(2)),
        joinedAt: u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : '',
      });
    }

    return results;
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
