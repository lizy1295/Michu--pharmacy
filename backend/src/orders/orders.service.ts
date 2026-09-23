import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnprocessableEntityException,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus, PaymentStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/product.entity';
import { Prescription, PrescriptionStatus } from '../prescriptions/entities/prescription.entity';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/create-order.dto';
import { sanitizeText } from '../common/utils/sanitize.util';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepo: Repository<Order>,
    @Optional()
    @InjectRepository(Product)
    private readonly productsRepo?: Repository<Product>,
    @Optional()
    @InjectRepository(Prescription)
    private readonly prescriptionsRepo?: Repository<Prescription>,
  ) {}

  async findAll(status?: OrderStatus, search?: string, page = 1, limit = 20): Promise<{ data: Order[]; total: number; page: number; limit: number }> {
    const query = this.ordersRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.orderItems', 'orderItems')
      .leftJoinAndSelect('orderItems.product', 'product');

    if (status) {
      query.andWhere('order.status = :status', { status });
    }

    if (search) {
      const sanitizedSearch = sanitizeText(search);
      query.andWhere(
        '(LOWER(order.customerName) LIKE LOWER(:search) OR LOWER(order.orderNumber) LIKE LOWER(:search))',
        { search: `%${sanitizedSearch}%` },
      );
    }

    query.orderBy('order.createdAt', 'DESC');
    query.skip((page - 1) * limit).take(limit);

    const [data, total] = await query.getManyAndCount();
    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.ordersRepo.findOne({
      where: { id },
      relations: ['orderItems', 'orderItems.product'],
    });
    if (!order) throw new NotFoundException(`Order with id ${id} not found`);
    return order;
  }

  async create(dto: CreateOrderDto): Promise<Order> {
    // 1. Strict server-side validation for items and dosage quantities
    if (!dto.items || !Array.isArray(dto.items) || dto.items.length === 0) {
      throw new BadRequestException('Invalid order: items must be a non-empty array.');
    }

    const validatedItems = dto.items.map((item, index) => {
      // Validate item existence
      if (!item || typeof item !== 'object') {
        throw new BadRequestException(`Invalid item at index ${index}: item must be a valid object.`);
      }

      // Quantity validation: Must be a positive integer, not a string, not negative, not zero, not NaN/float
      const rawQuantity = (item as any).quantity;
      if (
        rawQuantity === undefined ||
        rawQuantity === null ||
        typeof rawQuantity !== 'number' ||
        !Number.isInteger(rawQuantity) ||
        rawQuantity <= 0
      ) {
        throw new BadRequestException(
          `Invalid dosage quantity for item "${item.name || index}": quantity must be a positive integer greater than 0 (received: ${JSON.stringify(rawQuantity)}).`,
        );
      }

      // Price validation
      const rawPrice = (item as any).price;
      if (typeof rawPrice !== 'number' || isNaN(rawPrice) || rawPrice < 0) {
        throw new BadRequestException(
          `Invalid price for item "${item.name || index}": price must be a non-negative number.`,
        );
      }

      // Sanitize item string properties
      return {
        id: Number(item.id),
        name: sanitizeText(item.name || ''),
        price: Number(rawPrice),
        quantity: rawQuantity,
        dosage: item.dosage ? sanitizeText(item.dosage) : undefined,
        prescriptionRequired: Boolean(item.prescriptionRequired),
        imageType: item.imageType ? sanitizeText(item.imageType) : undefined,
      };
    });

    // 2. Strict sanitization for all customer text fields
    const sanitizedCustomerName = sanitizeText(dto.customerName);
    const sanitizedCustomerEmail = sanitizeText(dto.customerEmail);
    const sanitizedCustomerPhone = sanitizeText(dto.customerPhone);
    const sanitizedShippingAddress = sanitizeText(dto.shippingAddress);
    const sanitizedNotes = dto.notes ? sanitizeText(dto.notes) : undefined;

    if (!sanitizedCustomerName || sanitizedCustomerName.length === 0) {
      throw new BadRequestException('Customer name is required and cannot be empty.');
    }

    if (!sanitizedShippingAddress || sanitizedShippingAddress.length === 0) {
      throw new BadRequestException('Shipping address is required and cannot be empty.');
    }

    if (this.productsRepo) {
      for (const item of validatedItems) {
        const product = await this.productsRepo.findOne({ where: { id: item.id } });
        if (!product) {
          throw new UnprocessableEntityException(`Product with ID ${item.id} not found.`);
        }
        if (product.stock !== undefined && product.stock !== null && product.stock < item.quantity) {
          throw new UnprocessableEntityException(
            `Product "${product.name}" is out of stock or has insufficient quantity (available: ${product.stock}, requested: ${item.quantity}).`,
          );
        }
      }
    }

    const count = await this.ordersRepo.count();
    const orderNumber = `ORD-${String(count + 1).padStart(4, '0')}`;

    // Server-side calculation of subtotal from validated item prices and quantities
    const calculatedSubtotal = validatedItems.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0,
    );
    const tax = dto.tax !== undefined && typeof dto.tax === 'number' && dto.tax >= 0 ? dto.tax : 0;
    const deliveryFee = dto.deliveryFee !== undefined && typeof dto.deliveryFee === 'number' && dto.deliveryFee >= 0 ? dto.deliveryFee : 0;
    const total = calculatedSubtotal + tax + deliveryFee;

    const orderItems = validatedItems.map((item) => {
      const oi = new OrderItem();
      oi.productId = Number(item.id);
      oi.quantity = Number(item.quantity);
      oi.unitPrice = Number(item.price);
      return oi;
    });

    const order = this.ordersRepo.create({
      orderNumber,
      customerId: dto.customerId || 1,
      customerName: sanitizedCustomerName,
      customerEmail: sanitizedCustomerEmail,
      customerPhone: sanitizedCustomerPhone,
      shippingAddress: sanitizedShippingAddress,
      orderItems,
      subtotal: calculatedSubtotal,
      tax,
      deliveryFee,
      total,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      notes: sanitizedNotes,
    });
    order.items = validatedItems;

    return this.ordersRepo.save(order);
  }

  async updateStatus(id: number, dto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.findOne(id);

    // Block shipping when any item in the order requires a prescription that is still PENDING
    if (dto.status === OrderStatus.SHIPPED && this.prescriptionsRepo) {
      const requiresPrescriptionItems = (order.items || []).filter(
        (item) => item.prescriptionRequired,
      );
      if (requiresPrescriptionItems.length > 0) {
        // Look up by customer email; at least one PENDING prescription for this order's customer
        const pendingPrescription = await this.prescriptionsRepo
          .createQueryBuilder('rx')
          .where('LOWER(rx.patientEmail) = LOWER(:email)', { email: order.customerEmail })
          .andWhere('rx.status = :status', { status: PrescriptionStatus.PENDING })
          .getOne();

        if (pendingPrescription) {
          throw new Error(
            `Order cannot be shipped: prescription #${pendingPrescription.prescriptionNumber} for customer ${order.customerEmail} is still PENDING approval.`,
          );
        }
      }
    }

    order.status = dto.status;

    if (dto.notes !== undefined) {
      order.notes = sanitizeText(dto.notes);
    }

    if (dto.status === OrderStatus.APPROVED) order.approvedAt = new Date();
    if (dto.status === OrderStatus.SHIPPED) order.shippedAt = new Date();
    if (dto.status === OrderStatus.COMPLETED) order.completedAt = new Date();

    return this.ordersRepo.save(order);
  }

  async findByCustomer(email?: string, customerId?: number): Promise<Order[]> {
    const query = this.ordersRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.orderItems', 'orderItems')
      .leftJoinAndSelect('orderItems.product', 'product');

    if (customerId) {
      query.andWhere('order.customerId = :customerId', { customerId });
    } else if (email) {
      const sanitizedEmail = sanitizeText(email);
      query.andWhere('LOWER(order.customerEmail) = LOWER(:email)', { email: sanitizedEmail });
    } else {
      return [];
    }
    query.orderBy('order.createdAt', 'DESC');
    return query.getMany();
  }
}
