import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
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
import { ChapaService } from './services/chapa.service';
import { ReceiptsService } from '../receipts/receipts.service';

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
    private readonly chapaService: ChapaService,
    private readonly receiptsService: ReceiptsService,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * POST /payments/initialize (Phase 2)
   *
   * Security contract
   * -----------------
   * - userId MUST come from the verified JWT (set by controller via @CurrentUser).
   *   It is NEVER read from the request body.
   * - amount is ALWAYS read from order.total in the database.
   *   Any amount sent by the frontend is silently ignored.
   * - Order ownership is verified: order.customerId must equal userId.
   */
  async initiatePayment(
    dto: InitiatePaymentDto,
    /**
     * The authenticated user's numeric ID extracted from the JWT.
     * The controller MUST supply this — it is never taken from the DTO.
     */
    userId: number,
  ): Promise<{
    paymentId: number;
    paymentNumber: string;
    reference: string;
    paymentMethod: string;
    method: string;
    amount: number;
    checkoutUrl?: string;
    providerReference?: string;
    status: string;
  }> {
    // ── 1. Load the order from the database ────────────────────────────────
    const order = await this.ordersRepo.findOne({ where: { id: dto.orderId } });
    if (!order) {
      throw new NotFoundException(`Order ${dto.orderId} not found`);
    }

    // ── 2. Ownership guard — authenticated user must own the order ──────────
    //    customerId was set from JWT at order-creation time (see OrdersController).
    if (Number(order.customerId) !== Number(userId)) {
      this.logger.warn(
        `[Security] User ${userId} attempted to pay for order ${order.id} owned by customer ${order.customerId}`,
      );
      // Use a generic 403 — do not reveal whose order it is
      throw new ForbiddenException('You are not authorized to pay for this order.');
    }

    // ── 3. Order state validation ───────────────────────────────────────────
    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Cannot initiate payment for a cancelled order.');
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException(`Order ${order.orderNumber} is already paid.`);
    }

    // ── 4. Get REAL amount from the database — never trust the frontend ─────
    const amount = Number(order.total);
    if (!amount || amount <= 0) {
      throw new BadRequestException('Order total is invalid. Please contact support.');
    }

    // ── 5. Generate unique transaction reference ────────────────────────────
    const timestamp = Date.now();
    const paymentNumber = `PAY-${timestamp}-${order.id}`;

    // ── 6. Build URLs ───────────────────────────────────────────────────────
    const baseUrl = this.configService.get<string>('CORS_ORIGIN', 'http://localhost:3000');
    const returnUrl =
      dto.returnUrl ??
      `${baseUrl}/cart?orderId=${order.id}&paymentNumber=${paymentNumber}`;

    const apiBase = this.configService.get<string>(
      'API_BASE_URL',
      'http://localhost:3001/api/v1',
    );
    const callbackUrl = `${apiBase}/payments/webhook/${dto.paymentMethod}`;

    // ── 7. Call Payment Provider (Telebirr or CBE Birr direct) ─────────────
    let initResult: {
      success: boolean;
      checkoutUrl?: string;
      providerReference?: string;
      providerTransactionId?: string;
      rawResponse?: any;
      message?: string;
    };

    if (dto.paymentMethod === PaymentProviderMethod.TELEBIRR) {
      initResult = await this.telebirrService.initiatePayment({
        paymentNumber,
        amount,
        title: `Order ${order.orderNumber} — Michu Pharmacy`,
        notifyUrl: callbackUrl,
        returnUrl,
      });
    } else if (dto.paymentMethod === PaymentProviderMethod.CBE) {
      initResult = await this.cbeService.initiatePayment({
        paymentNumber,
        amount,
        title: `Order ${order.orderNumber} — Michu Pharmacy`,
        notifyUrl: callbackUrl,
        returnUrl,
      });
    } else {
      // Optional Chapa fallback if another method was requested
      const chapaRes = await this.chapaService.initializeTransaction({
        txRef: paymentNumber,
        amount,
        email: order.customerEmail || 'customer@michu.et',
        firstName: order.customerName.split(' ')[0] ?? order.customerName,
        lastName: order.customerName.split(' ').slice(1).join(' ') || order.customerName,
        method: dto.paymentMethod as any,
        title: `Order ${order.orderNumber} — Michu Pharmacy`,
        returnUrl,
        callbackUrl,
      });
      initResult = {
        success: chapaRes.success,
        checkoutUrl: chapaRes.checkoutUrl,
        providerReference: chapaRes.chapaReference,
        rawResponse: chapaRes.rawResponse,
        message: chapaRes.message,
      };
    }

    // ── 8. Persist payment record ───────────────────────────────────────────
    const payment = this.paymentsRepo.create({
      paymentNumber,
      orderId: order.id,
      userId,                          // track which user initiated
      paymentMethod: dto.paymentMethod,
      amount,
      currency: 'ETB',
      status: initResult.success
        ? PaymentRecordStatus.PAYMENT_INITIATED
        : PaymentRecordStatus.PENDING,
      providerReference: initResult.providerReference,
      providerTransactionId: initResult.providerTransactionId,
      checkoutUrl: initResult.checkoutUrl,
      errorMessage: initResult.success ? undefined : initResult.message,
      rawPayload: (initResult.rawResponse ?? {}) as any,
    });

    const savedPayment = await this.paymentsRepo.save(payment);

    // ── 9. Handle provider failure ──────────────────────────────────────────
    if (!initResult.success) {
      this.logger.error(
        `[${dto.paymentMethod}] Failed to initialize payment for order ${order.orderNumber} — ${initResult.message ?? 'unknown error'}`,
      );
      throw new BadRequestException(
        initResult.message || 'Payment gateway initialization failed. Please try again in a moment.',
      );
    }

    // ── 10. Update order payment status (only on Chapa success) ────────────
    //     Do NOT set PaymentStatus.PAID here — that is Phase 3 (webhook/verify).
    order.paymentMethod = dto.paymentMethod;
    order.paymentStatus = PaymentStatus.PAYMENT_INITIATED;
    await this.ordersRepo.save(order);

    this.logger.log(
      `[Payment Initialized] paymentNumber=${savedPayment.paymentNumber} orderId=${order.id} userId=${userId} amount=${amount} method=${dto.paymentMethod}`,
    );

    return {
      paymentId: savedPayment.id,
      paymentNumber: savedPayment.paymentNumber,
      reference: savedPayment.paymentNumber,
      paymentMethod: savedPayment.paymentMethod,
      method: savedPayment.paymentMethod,
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

    let verificationResult: {
      success: boolean;
      paid?: boolean;
      providerTransactionId?: string;
      status?: string;
      message?: string;
    };

    if (payment.paymentMethod === PaymentProviderMethod.TELEBIRR) {
      verificationResult = await this.telebirrService.verifyPayment(
        payment.paymentNumber,
        payment.providerReference,
      );
    } else if (payment.paymentMethod === PaymentProviderMethod.CBE) {
      verificationResult = await this.cbeService.verifyPayment(
        payment.paymentNumber,
        payment.providerReference,
      );
    } else {
      const chapaRes = await this.chapaService.verifyTransaction(payment.paymentNumber);
      const isSuccess = chapaRes.success && (chapaRes.status === 'success' || chapaRes.status === 'paid');
      const isAmountValid = chapaRes.amount != null && Math.abs(Number(chapaRes.amount) - Number(payment.amount)) < 0.01;
      const isCurrencyValid = chapaRes.currency?.toUpperCase() === 'ETB';

      verificationResult = {
        success: isSuccess && isAmountValid && isCurrencyValid,
        paid: isSuccess && isAmountValid && isCurrencyValid,
        providerTransactionId: chapaRes.reference || chapaRes.txRef,
        status: isSuccess ? 'PAID' : (chapaRes.status ?? 'FAILED'),
        message: chapaRes.message,
      };
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

          // Automatically generate ONE receipt inside transaction
          await this.receiptsService.createReceipt(order, lockedPayment, queryRunner.manager);
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
   * Process Chapa webhook event (Phase 3 & Phase 4)
   *
   * Security & Idempotency Pipeline:
   * 1. Verify HMAC signature using CHAPA_WEBHOOK_SECRET.
   * 2. Extract transaction reference.
   * 3. Find matching payment.
   * 4. Idempotency: Return immediately if payment is already PAID.
   * 5. Never trust webhook payload alone — call Chapa's official Transaction Verification API.
   * 6. Double-check: status === 'success', tx_ref matches, amount matches DB, currency === 'ETB'.
   * 7. In DB transaction: payment -> PAID (paidAt = now), order -> PAID + APPROVED, deduct stock.
   * 8. Automatically generate ONE receipt linking order and payment.
   */
  async processChapaWebhook(
    body: any,
    headers: any,
  ): Promise<{ received: boolean; message: string; receiptNumber?: string; paymentNumber?: string }> {
    this.logger.log('[Chapa Webhook] Received webhook event');

    // ── 1. Verify signature ────────────────────────────────────────────────
    const signature =
      headers?.['x-chapa-signature'] ||
      headers?.['chapa-signature'] ||
      headers?.['X-CHAPA-SIGNATURE'];

    const isValidSig = this.chapaService.validateWebhookSignature(body, signature);
    if (!isValidSig) {
      this.logger.warn('[Chapa Webhook] Rejected: Invalid or missing webhook signature');
      return { received: false, message: 'Invalid webhook signature' };
    }

    // ── 2. Extract transaction reference ───────────────────────────────────
    const txRef = body?.tx_ref || body?.data?.tx_ref || body?.trx_ref || body?.reference;
    if (!txRef) {
      this.logger.warn('[Chapa Webhook] Rejected: Missing tx_ref in webhook body');
      return { received: false, message: 'Missing transaction reference in webhook' };
    }

    // ── 3. Find matching payment record ───────────────────────────────────
    const payment = await this.paymentsRepo.findOne({ where: { paymentNumber: txRef } });
    if (!payment) {
      this.logger.warn(`[Chapa Webhook] Rejected: Payment record not found for tx_ref=${txRef}`);
      return { received: false, message: 'Payment record not found' };
    }

    // ── 4. Idempotency check ──────────────────────────────────────────────
    if (payment.status === PaymentRecordStatus.PAID) {
      this.logger.log(`[Chapa Webhook] Payment ${txRef} already verified as PAID. Skipping duplicate.`);
      const existingReceipt = await this.receiptsService.findByOrderId(payment.orderId);
      return {
        received: true,
        message: 'Payment already processed and marked as PAID',
        receiptNumber: existingReceipt?.receiptNumber,
        paymentNumber: payment.paymentNumber,
      };
    }

    // ── 5. Query official Chapa Verification API ──────────────────────────
    // Never trust the webhook alone — verify directly with gateway
    const chapaVerify = await this.chapaService.verifyTransaction(txRef);

    // ── 6. Strict validation of all 4 criteria ────────────────────────────
    const isStatusOk = chapaVerify.success && (chapaVerify.status === 'success' || chapaVerify.status === 'paid');
    const isTxRefOk = chapaVerify.txRef === payment.paymentNumber;
    const isAmountOk = chapaVerify.amount != null && Math.abs(Number(chapaVerify.amount) - Number(payment.amount)) < 0.01;
    const isCurrencyOk = chapaVerify.currency?.toUpperCase() === 'ETB';

    if (!isStatusOk || !isTxRefOk || !isAmountOk || !isCurrencyOk) {
      const reason = !isStatusOk
        ? `Payment status is ${chapaVerify.status}`
        : !isTxRefOk
          ? `Transaction reference mismatch: expected ${payment.paymentNumber}, got ${chapaVerify.txRef}`
          : !isAmountOk
            ? `Amount mismatch: database expects ${payment.amount} ETB, Chapa reported ${chapaVerify.amount}`
            : `Currency mismatch: expected ETB, got ${chapaVerify.currency}`;

      this.logger.error(`[Chapa Webhook] Verification failed for tx_ref=${txRef}: ${reason}`);

      payment.status = PaymentRecordStatus.FAILED;
      payment.errorMessage = reason;
      payment.rawPayload = chapaVerify.rawResponse ?? body;
      await this.paymentsRepo.save(payment);

      return { received: false, message: reason };
    }

    // ── 7. Execute status transition & receipt generation in DB transaction ──
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const lockedPayment = await queryRunner.manager.findOne(Payment, {
        where: { id: payment.id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!lockedPayment) {
        throw new NotFoundException(`Payment ${payment.id} not found during lock`);
      }

      if (lockedPayment.status === PaymentRecordStatus.PAID) {
        await queryRunner.rollbackTransaction();
        const existingReceipt = await this.receiptsService.findByOrderId(lockedPayment.orderId);
        return {
          received: true,
          message: 'Payment already processed by concurrent request',
          receiptNumber: existingReceipt?.receiptNumber,
          paymentNumber: lockedPayment.paymentNumber,
        };
      }

      // Mark payment as PAID
      lockedPayment.status = PaymentRecordStatus.PAID;
      lockedPayment.paidAt = new Date();
      lockedPayment.providerTransactionId = chapaVerify.reference || chapaVerify.txRef;
      lockedPayment.rawPayload = chapaVerify.rawResponse ?? body;
      await queryRunner.manager.save(lockedPayment);

      // Mark order as PAID and APPROVED
      const order = await queryRunner.manager.findOne(Order, {
        where: { id: lockedPayment.orderId },
      });

      let receiptNumber: string | undefined;

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

        // Phase 4: Automatically create ONE digital receipt
        const receipt = await this.receiptsService.createReceipt(order, lockedPayment, queryRunner.manager);
        receiptNumber = receipt.receiptNumber;
      }

      await queryRunner.commitTransaction();
      this.logger.log(`[Chapa Webhook] Successfully processed tx_ref=${txRef} receipt=${receiptNumber}`);

      return {
        received: true,
        message: 'Payment verified and processed successfully',
        receiptNumber,
        paymentNumber: lockedPayment.paymentNumber,
      };
    } catch (err: any) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`[Chapa Webhook] Transaction failed for tx_ref=${txRef}`, err?.stack || err);
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Generic provider webhook callback handler
   */
  async handleWebhook(provider: string, body: any, headers: any): Promise<{ received: boolean; message: string }> {
    this.logger.log(`Received webhook callback for provider: ${provider}`);

    if (provider.toLowerCase() === 'chapa') {
      return this.processChapaWebhook(body, headers);
    }

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

  /**
   * Customer submits proof of payment (Transaction ID and/or Receipt screenshot)
   */
  async submitPaymentProof(data: {
    orderId: number;
    paymentMethod: string;
    transactionId?: string;
    proofImage?: string;
    userId: number;
  }): Promise<{
    paymentId: number;
    paymentNumber: string;
    orderNumber: string;
    transactionId?: string;
    proofImage?: string;
    status: string;
  }> {
    const order = await this.ordersRepo.findOne({ where: { id: data.orderId } });
    if (!order) {
      throw new NotFoundException(`Order ${data.orderId} not found`);
    }

    if (Number(order.customerId) !== Number(data.userId)) {
      throw new ForbiddenException('You are not authorized to submit payment proof for this order.');
    }

    if (!data.transactionId && !data.proofImage) {
      throw new BadRequestException('Please either upload a receipt screenshot or enter your Transaction ID.');
    }

    order.paymentMethod = data.paymentMethod;
    if (data.transactionId) {
      order.transactionId = data.transactionId;
    }
    if (data.proofImage) {
      order.proofImage = data.proofImage;
    }
    order.paymentStatus = PaymentStatus.PAYMENT_INITIATED;
    await this.ordersRepo.save(order);

    let payment = await this.paymentsRepo.findOne({ where: { orderId: order.id } });
    if (!payment) {
      payment = this.paymentsRepo.create({
        paymentNumber: `PAY-${Date.now()}-${order.id}`,
        orderId: order.id,
        userId: data.userId,
        paymentMethod: data.paymentMethod as any,
        amount: Number(order.total),
        currency: 'ETB',
        status: PaymentRecordStatus.PAYMENT_INITIATED,
        providerTransactionId: data.transactionId || undefined,
        proofImage: data.proofImage || undefined,
      });
    } else {
      payment.paymentMethod = data.paymentMethod as any;
      if (data.transactionId) {
        payment.providerTransactionId = data.transactionId;
      }
      if (data.proofImage) {
        payment.proofImage = data.proofImage;
      }
      payment.status = PaymentRecordStatus.PAYMENT_INITIATED;
    }
    const saved = await this.paymentsRepo.save(payment);

    this.logger.log(
      `[Proof Submitted] Order ${order.orderNumber} - Method: ${data.paymentMethod}, TxnID: ${data.transactionId || 'Image Attached'}`,
    );

    return {
      paymentId: saved.id,
      paymentNumber: saved.paymentNumber,
      orderNumber: order.orderNumber,
      transactionId: data.transactionId,
      proofImage: data.proofImage,
      status: saved.status,
    };
  }

  /**
   * Admin verifies and approves payment proof after checking bank/telebirr account statement
   */
  async adminApprovePayment(orderId: number): Promise<{
    success: boolean;
    payment: Payment;
    receipt: any;
    message: string;
  }> {
    const order = await this.ordersRepo.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    let payment = await this.paymentsRepo.findOne({ where: { orderId: order.id } });
    if (!payment) {
      payment = this.paymentsRepo.create({
        paymentNumber: `PAY-${Date.now()}-${order.id}`,
        orderId: order.id,
        userId: order.customerId,
        paymentMethod: (order.paymentMethod || 'telebirr') as any,
        amount: Number(order.total),
        currency: 'ETB',
        status: PaymentRecordStatus.PAYMENT_INITIATED,
        providerTransactionId: order.transactionId || undefined,
        proofImage: order.proofImage || undefined,
      });
      payment = await this.paymentsRepo.save(payment);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const lockedPayment = await queryRunner.manager.findOne(Payment, {
        where: { id: payment.id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!lockedPayment) {
        throw new NotFoundException('Payment not found');
      }

      lockedPayment.status = PaymentRecordStatus.PAID;
      lockedPayment.paidAt = new Date();
      if (order.transactionId) {
        lockedPayment.providerTransactionId = order.transactionId;
      }
      if (order.proofImage) {
        lockedPayment.proofImage = order.proofImage;
      }
      await queryRunner.manager.save(lockedPayment);

      order.paymentStatus = PaymentStatus.PAID;
      if (order.status === OrderStatus.PENDING) {
        order.status = OrderStatus.APPROVED;
        order.approvedAt = new Date();
      }
      await queryRunner.manager.save(order);

      // Deduct inventory stock safely
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

      // Generate official digital receipt
      const receipt = await this.receiptsService.createReceipt(order, lockedPayment, queryRunner.manager);

      await queryRunner.commitTransaction();
      this.logger.log(`[Admin Approved] Order ${order.orderNumber} approved and marked PAID.`);

      return {
        success: true,
        payment: lockedPayment,
        receipt,
        message: 'Payment verified and approved successfully by admin.',
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Admin rejects payment proof
   */
  async adminRejectPayment(orderId: number, reason?: string): Promise<{ success: boolean; message: string }> {
    const order = await this.ordersRepo.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    order.paymentStatus = PaymentStatus.FAILED;
    await this.ordersRepo.save(order);

    const payment = await this.paymentsRepo.findOne({ where: { orderId: order.id } });
    if (payment) {
      payment.status = PaymentRecordStatus.FAILED;
      payment.errorMessage = reason || 'Payment proof rejected by admin.';
      await this.paymentsRepo.save(payment);
    }

    return { success: true, message: 'Payment rejected.' };
  }
}
