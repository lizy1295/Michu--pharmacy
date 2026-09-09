import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Receipt } from './entities/receipt.entity';
import { Order } from '../orders/entities/order.entity';
import { Payment } from '../payments/entities/payment.entity';

@Injectable()
export class ReceiptsService {
  private readonly logger = new Logger(ReceiptsService.name);

  constructor(
    @InjectRepository(Receipt)
    private readonly receiptsRepo: Repository<Receipt>,
  ) {}

  /**
   * Automatically create ONE receipt for a verified paid order & payment.
   * Idempotent: If a receipt already exists for this order, returns the existing receipt.
   */
  async createReceipt(
    order: Order,
    payment: Payment,
    manager?: EntityManager,
  ): Promise<Receipt> {
    const repo = manager ? manager.getRepository(Receipt) : this.receiptsRepo;

    // 1. Idempotency check: prevent duplicate receipts for the same order
    const existing = await repo.findOne({ where: { orderId: order.id } });
    if (existing) {
      this.logger.log(
        `[Receipt] Receipt already exists for order ${order.orderNumber}: ${existing.receiptNumber}`,
      );
      return existing;
    }

    // 2. Generate unique receipt number (e.g. REC-1725800000000-42)
    const timestamp = Date.now();
    const receiptNumber = `REC-${timestamp}-${order.id}`;

    // 3. Create receipt snapshot
    const receipt = repo.create({
      receiptNumber,
      orderId: order.id,
      paymentId: payment.id,
      amount: Number(order.total),
      currency: payment.currency || 'ETB',
      paymentMethod: payment.paymentMethod,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      items: Array.isArray(order.items) ? order.items : [],
      subtotal: Number(order.subtotal),
      tax: Number(order.tax || 0),
      deliveryFee: Number(order.deliveryFee || 0),
      total: Number(order.total),
      issuedAt: new Date(),
    });

    const saved = await repo.save(receipt);
    this.logger.log(
      `[Receipt Created] receiptNumber=${saved.receiptNumber} orderId=${order.id} paymentId=${payment.id} total=${saved.total} ETB`,
    );

    return saved;
  }

  /**
   * Find receipt by Order ID
   */
  async findByOrderId(orderId: number): Promise<Receipt | null> {
    return this.receiptsRepo.findOne({
      where: { orderId },
      relations: ['order', 'payment'],
    });
  }

  /**
   * Find receipt by unique receipt number
   */
  async findByReceiptNumber(receiptNumber: string): Promise<Receipt> {
    const receipt = await this.receiptsRepo.findOne({
      where: { receiptNumber },
      relations: ['order', 'payment'],
    });
    if (!receipt) {
      throw new NotFoundException(`Receipt ${receiptNumber} not found`);
    }
    return receipt;
  }

  /**
   * Find receipt by primary key ID
   */
  async findById(id: number): Promise<Receipt> {
    const receipt = await this.receiptsRepo.findOne({
      where: { id },
      relations: ['order', 'payment'],
    });
    if (!receipt) {
      throw new NotFoundException(`Receipt with ID ${id} not found`);
    }
    return receipt;
  }
}
