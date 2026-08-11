import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus, PaymentStatus } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepo: Repository<Order>,
  ) {}

  async findAll(status?: OrderStatus, search?: string, page = 1, limit = 20): Promise<{ data: Order[]; total: number; page: number; limit: number }> {
    const query = this.ordersRepo.createQueryBuilder('order');

    if (status) {
      query.andWhere('order.status = :status', { status });
    }

    if (search) {
      query.andWhere(
        '(LOWER(order.customerName) LIKE LOWER(:search) OR LOWER(order.orderNumber) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    query.orderBy('order.createdAt', 'DESC');
    query.skip((page - 1) * limit).take(limit);

    const [data, total] = await query.getManyAndCount();
    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.ordersRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException(`Order with id ${id} not found`);
    return order;
  }

  async create(dto: CreateOrderDto): Promise<Order> {
    const count = await this.ordersRepo.count();
    const orderNumber = `ORD-${String(count + 1).padStart(4, '0')}`;

    const subtotal = dto.subtotal || 0;
    const tax = dto.tax || 0;
    const deliveryFee = dto.deliveryFee || 0;
    const total = subtotal + tax + deliveryFee;

    const order = this.ordersRepo.create({
      orderNumber,
      customerId: dto.customerId,
      customerName: dto.customerName,
      customerEmail: dto.customerEmail,
      customerPhone: dto.customerPhone,
      shippingAddress: dto.shippingAddress,
      items: dto.items || [],
      subtotal,
      tax,
      deliveryFee,
      total,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      notes: dto.notes,
    });

    return this.ordersRepo.save(order);
  }

  async updateStatus(id: number, dto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.findOne(id);
    order.status = dto.status;
    
    if (dto.status === OrderStatus.APPROVED) order.approvedAt = new Date();
    if (dto.status === OrderStatus.SHIPPED) order.shippedAt = new Date();
    if (dto.status === OrderStatus.COMPLETED) order.completedAt = new Date();

    return this.ordersRepo.save(order);
  }

  async findByCustomer(email?: string, customerId?: number): Promise<Order[]> {
    const query = this.ordersRepo.createQueryBuilder('order');
    if (customerId) {
      query.andWhere('order.customerId = :customerId', { customerId });
    } else if (email) {
      query.andWhere('LOWER(order.customerEmail) = LOWER(:email)', { email });
    } else {
      return [];
    }
    query.orderBy('order.createdAt', 'DESC');
    return query.getMany();
  }
}
