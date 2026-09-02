import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import {
  Payment,
  PaymentProviderMethod,
  PaymentRecordStatus,
} from './entities/payment.entity';
import { Order, OrderStatus, PaymentStatus } from '../orders/entities/order.entity';
import { Product } from '../products/product.entity';
import { TelebirrService } from './services/telebirr.service';
import { CbeService } from './services/cbe.service';

import { InitiatePaymentDto } from './dto/initiate-payment.dto';
export { InitiatePaymentDto };

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepo: Repository<Payment>,
    @InjectRepository(Order)
    private readonly ordersRepo: Repository<Order>,
    @InjectRepository(Product)
    private readonly productsRepo: Repository<Product>,
    private readonly telebirrService: TelebirrService,
    private readonly cbeService: CbeService,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Creates a payment record & calls payment gateway provider
   */
  async initiatePayment(dto: InitiatePaymentDto): Promise<{
    paymentId: number;
    paymentNumber: string;
    paymentMethod: string;
    amount: number;
    checkoutUrl?: string;
    providerReference?: string;
    status: string;
  }> {
    const order = await this.ordersRepo.findOne({ where: { id: dto.orderId } });
    if (!order) {
      throw new NotFoundException(`Order with ID ${dto.orderId} not found`);
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException(`Order ${order.orderNumber} is already paid.`);
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException(`Cannot initiate payment for a cancelled order.`);
    }

    // Generate unique payment number
    const timestamp = Date.now();
    const paymentNumber = `PAY-${timestamp}-${order.id}`;
    const amount = Number(order.total);

    const baseUrl = this.configService.get<string>('CORS_ORIGIN', 'http://localhost:3000');
    const returnUrl = dto.returnUrl || `${baseUrl}/cart?orderId=${order.id}&paymentNumber=${paymentNumber}`;
    const notifyUrl = `${this.configService.get<string>(
      'API_BASE_URL',
      'http://localhost:3001/api/v1',
    )}/payments/webhook/${dto.paymentMethod}`;

    let providerResult;
    if (dto.paymentMethod === PaymentProviderMethod.TELEBIRR) {
      providerResult = await this.telebirrService.initiatePayment({
        paymentNumber,
        amount,
        title: `Order ${order.orderNumber} Michu Pharmacy`,
        notifyUrl,
        returnUrl,
      });
    } else if (dto.paymentMethod === PaymentProviderMethod.CBE) {
      providerResult = await this.cbeService.initiatePayment({
        paymentNumber,
        amount,
        title: `Order ${order.orderNumber} Michu Pharmacy`,
        notifyUrl,
        returnUrl,
      });
    } else {
      throw new BadRequestException(`Unsupported payment method: ${dto.paymentMethod}`);
    }

    if (!providerResult.success) {
      throw new BadRequestException(
        providerResult.message || 'Payment initiation failed with provider',
      );
    }

    const payment = this.paymentsRepo.create({
      paymentNumber,
      orderId: order.id,
      paymentMethod: dto.paymentMethod,
      amount,
      currency: 'ETB',
      providerTransactionId: providerResult.providerTransactionId,
      providerReference: providerResult.providerReference,
      checkoutUrl: providerResult.checkoutUrl,
      status: PaymentRecordStatus.PAYMENT_INITIATED,
      rawPayload: providerResult.rawResponse || {},
    });

    const savedPayment = await this.paymentsRepo.save(payment);

    // Update Order payment status
    order.paymentMethod = dto.paymentMethod;
    order.paymentStatus = PaymentStatus.PAYMENT_INITIATED;
    await this.ordersRepo.save(order);

    return {
      paymentId: savedPayment.id,
      paymentNumber: savedPayment.paymentNumber,
      paymentMethod: savedPayment.paymentMethod,
      amount: savedPayment.amount,
      checkoutUrl: savedPayment.checkoutUrl,
      providerReference: savedPayment.providerReference,
      status: savedPayment.status,
    };
  }

  /**
   * Idempotent payment verification against official provider API & DB update
   */
  async verifyPayment(paymentId: number): Promise<{
    success: boolean;
    status: PaymentRecordStatus;
    payment: Payment;
    message?: string;
  }> {
    const payment = await this.paymentsRepo.findOne({
      where: { id: paymentId },
      relations: ['order'],
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${paymentId} not found`);
    }

    // Idempotency: If already marked PAID, return clean verified response without re-processing
    if (payment.status === PaymentRecordStatus.PAID) {
      return {
        success: true,
        status: PaymentRecordStatus.PAID,
        payment,
        message: 'Payment is already verified and marked as PAID.',
      };
    }

    let verificationResult;
    if (payment.paymentMethod === PaymentProviderMethod.TELEBIRR) {
      verificationResult = await this.telebirrService.verifyPayment(
        payment.paymentNumber,
        payment.providerReference,
      );
    } else {
      verificationResult = await this.cbeService.verifyPayment(
        payment.paymentNumber,
        payment.providerReference,
      );
    }

    if (!verificationResult.success) {
      return {
        success: false,
        status: payment.status,
        payment,
        message: verificationResult.message || 'Verification failed at payment gateway',
      };
    }

    // Process status update inside a database transaction to protect inventory and order state
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const lockedPayment = await queryRunner.manager.findOne(Payment, {
        where: { id: paymentId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!lockedPayment) {
        throw new NotFoundException(`Payment ${paymentId} not found during lock`);
      }

      if (lockedPayment.status === PaymentRecordStatus.PAID) {
        await queryRunner.rollbackTransaction();
        return {
          success: true,
          status: PaymentRecordStatus.PAID,
          payment: lockedPayment,
          message: 'Payment already processed by concurrent verification call.',
        };
      }

      if (verificationResult.paid) {
        lockedPayment.status = PaymentRecordStatus.PAID;
        lockedPayment.paidAt = new Date();
        if (verificationResult.providerTransactionId) {
          lockedPayment.providerTransactionId = verificationResult.providerTransactionId;
        }
        await queryRunner.manager.save(lockedPayment);

        const order = await queryRunner.manager.findOne(Order, {
          where: { id: lockedPayment.orderId },
        });

        if (order) {
          order.paymentStatus = PaymentStatus.PAID;
          if (order.status === OrderStatus.PENDING) {
            order.status = OrderStatus.APPROVED;
            order.approvedAt = new Date();
          }
          await queryRunner.manager.save(order);

          // Deduct product inventory stock safely
          if (Array.isArray(order.items)) {
            for (const item of order.items) {
              const productId = Number(item.id || item.productId);
              const qty = Number(item.quantity || 1);

              if (productId && qty > 0) {
                const product = await queryRunner.manager.findOne(Product, {
                  where: { id: productId },
                });
                if (product) {
                  product.stock = Math.max(0, Number(product.stock) - qty);
                  await queryRunner.manager.save(product);
                }
              }
            }
          }
        }

        await queryRunner.commitTransaction();
        this.logger.log(`[Payment Verified & Processed] Payment ${lockedPayment.paymentNumber} marked PAID.`);

        return {
          success: true,
          status: PaymentRecordStatus.PAID,
          payment: lockedPayment,
          message: 'Payment verified and marked as PAID.',
        };
      } else {
        // Payment not paid yet or failed
        if (verificationResult.status === 'FAILED' || verificationResult.status === 'CANCELLED') {
          lockedPayment.status =
            verificationResult.status === 'CANCELLED'
              ? PaymentRecordStatus.CANCELLED
              : PaymentRecordStatus.FAILED;
          await queryRunner.manager.save(lockedPayment);

          const order = await queryRunner.manager.findOne(Order, {
            where: { id: lockedPayment.orderId },
          });
          if (order) {
            order.paymentStatus =
              verificationResult.status === 'CANCELLED'
                ? PaymentStatus.CANCELLED
                : PaymentStatus.FAILED;
            await queryRunner.manager.save(order);
          }
        }

        await queryRunner.commitTransaction();
        return {
          success: false,
          status: lockedPayment.status,
          payment: lockedPayment,
          message: verificationResult.message || 'Payment is still pending completion.',
        };
      }
    } catch (err: any) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Error verifying payment ${paymentId}`, err?.stack || err);
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findOne(id: number): Promise<Payment> {
    const payment = await this.paymentsRepo.findOne({ where: { id }, relations: ['order'] });
    if (!payment) throw new NotFoundException(`Payment with ID ${id} not found`);
    return payment;
  }

  async findByOrderId(orderId: number): Promise<Payment | null> {
    return this.paymentsRepo.findOne({
      where: { orderId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Webhook callback handler
   */
  async handleWebhook(provider: string, body: any, headers: any): Promise<{ received: boolean; message: string }> {
    this.logger.log(`Received webhook callback for provider: ${provider}`);

    let isValid = false;
    if (provider === PaymentProviderMethod.TELEBIRR) {
      isValid = this.telebirrService.validateWebhookSignature(body);
    } else if (provider === PaymentProviderMethod.CBE) {
      const signature = headers['x-cbe-signature'] || headers['X-CBE-SIGNATURE'] || body.signature;
      isValid = this.cbeService.validateWebhookSignature(JSON.stringify(body), signature);
    }

    if (!isValid) {
      this.logger.warn(`Invalid signature for webhook call from ${provider}`);
      return { received: false, message: 'Invalid signature' };
    }

    const paymentNumber = body.outTradeNo || body.referenceNumber || body.paymentNumber;
    if (!paymentNumber) {
      return { received: false, message: 'Missing payment number in callback body' };
    }

    const payment = await this.paymentsRepo.findOne({ where: { paymentNumber } });
    if (!payment) {
      return { received: false, message: `Payment ${paymentNumber} not found` };
    }

    await this.verifyPayment(payment.id);

    return { received: true, message: 'Webhook callback processed successfully' };
  }
}
