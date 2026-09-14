import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import * as crypto from 'crypto';
import { PaymentsService } from './payments.service';
import { Payment, PaymentRecordStatus, PaymentProviderMethod } from './entities/payment.entity';
import { Order, OrderStatus, PaymentStatus } from '../orders/entities/order.entity';
import { Product } from '../products/product.entity';
import { Receipt } from '../receipts/entities/receipt.entity';
import { TelebirrService } from './services/telebirr.service';
import { CbeService } from './services/cbe.service';
import { ChapaService } from './services/chapa.service';
import { ReceiptsService } from '../receipts/receipts.service';
import { ReceiptsController } from '../receipts/receipts.controller';

describe('Payments & Verification Phase 3 & 4 (14 Scenarios)', () => {
  let paymentsService: PaymentsService;
  let chapaService: ChapaService;
  let receiptsService: ReceiptsService;
  let receiptsController: ReceiptsController;
  let paymentsRepo: any;
  let ordersRepo: any;
  let receiptsRepo: any;
  let queryRunner: any;

  const testWebhookSecret = 'test_webhook_secret_key_12345';

  function signPayload(payload: any): string {
    const str = typeof payload === 'string' ? payload : JSON.stringify(payload);
    return crypto.createHmac('sha256', testWebhookSecret).update(str).digest('hex');
  }

  beforeEach(async () => {
    queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        findOne: jest.fn(),
        save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
        getRepository: jest.fn(),
      },
    };

    paymentsRepo = {
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((d) => ({ id: 10, ...d })),
      save: jest.fn().mockImplementation((d) => Promise.resolve({ id: 10, ...d })),
    };

    ordersRepo = {
      findOne: jest.fn(),
      save: jest.fn().mockImplementation((d) => Promise.resolve(d)),
    };

    receiptsRepo = {
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((d) => ({ id: 50, ...d })),
      save: jest.fn().mockImplementation((d) => Promise.resolve({ id: 50, ...d })),
    };

    queryRunner.manager.getRepository.mockReturnValue(receiptsRepo);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        ChapaService,
        ReceiptsService,
        ReceiptsController,
        { provide: getRepositoryToken(Payment), useValue: paymentsRepo },
        { provide: getRepositoryToken(Order), useValue: ordersRepo },
        { provide: getRepositoryToken(Product), useValue: {} },
        { provide: getRepositoryToken(Receipt), useValue: receiptsRepo },
        {
          provide: TelebirrService,
          useValue: {
            initiatePayment: jest.fn().mockResolvedValue({
              success: true,
              checkoutUrl: 'https://checkout.chapa.co/checkout/payment/PAY-100',
              providerReference: 'PAY-100',
            }),
            verifyPayment: jest.fn().mockResolvedValue({ success: true, paid: true }),
            validateWebhookSignature: jest.fn().mockReturnValue(true),
          },
        },
        { provide: CbeService, useValue: {} },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultVal?: string) => {
              if (key === 'CHAPA_SECRET_KEY') return 'CHASECK_TEST-sample';
              if (key === 'CHAPA_BASE_URL') return 'https://api.chapa.co';
              if (key === 'CHAPA_WEBHOOK_SECRET') return testWebhookSecret;
              if (key === 'CORS_ORIGIN') return 'http://localhost:3000';
              if (key === 'API_BASE_URL') return 'http://localhost:3001/api/v1';
              return defaultVal;
            }),
          },
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: () => queryRunner,
          },
        },
      ],
    }).compile();

    paymentsService = module.get<PaymentsService>(PaymentsService);
    chapaService = module.get<ChapaService>(ChapaService);
    receiptsService = module.get<ReceiptsService>(ReceiptsService);
    receiptsController = module.get<ReceiptsController>(ReceiptsController);
  });

  // ─── 1. Successful payment verification ──────────────────────────────────
  it('1. Successful payment: valid signature + Chapa verify success marks payment & order PAID and creates receipt', async () => {
    const txRef = 'PAY-1725800000000-1';
    const mockPayment: Partial<Payment> = {
      id: 1,
      paymentNumber: txRef,
      orderId: 101,
      amount: 450,
      currency: 'ETB',
      status: PaymentRecordStatus.PAYMENT_INITIATED,
      paymentMethod: PaymentProviderMethod.TELEBIRR,
    };

    const mockOrder: Partial<Order> = {
      id: 101,
      orderNumber: 'ORD-101',
      customerId: 42,
      customerName: 'Abebe Bikila',
      customerEmail: 'abebe@example.com',
      total: 450,
      subtotal: 391.3,
      tax: 58.7,
      deliveryFee: 0,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PAYMENT_INITIATED,
      items: [{ id: 1, name: 'Paracetamol', price: 450, quantity: 1 }],
    };

    paymentsRepo.findOne.mockResolvedValue(mockPayment);
    queryRunner.manager.findOne.mockImplementation((entityClass: any, criteria: any) => {
      if (entityClass === Payment) return Promise.resolve({ ...mockPayment });
      if (entityClass === Order) return Promise.resolve({ ...mockOrder });
      return Promise.resolve(null);
    });

    jest.spyOn(chapaService, 'verifyTransaction').mockResolvedValue({
      success: true,
      status: 'success',
      txRef,
      reference: 'CHAPA-REF-12345',
      amount: 450,
      currency: 'ETB',
    });

    const body = { tx_ref: txRef, status: 'success' };
    const signature = signPayload(body);

    const result = await paymentsService.processChapaWebhook(body, {
      'x-chapa-signature': signature,
    });

    expect(result.received).toBe(true);
    expect(result.receiptNumber).toMatch(/^REC-/);
    expect(queryRunner.commitTransaction).toHaveBeenCalled();
  });

  // ─── 2. Failed payment ───────────────────────────────────────────────────
  it('2. Failed payment: Chapa returns failed status -> marks payment FAILED, leaves order NOT paid, no receipt', async () => {
    const txRef = 'PAY-1725800000000-2';
    const mockPayment: Partial<Payment> = {
      id: 2,
      paymentNumber: txRef,
      orderId: 102,
      amount: 200,
      currency: 'ETB',
      status: PaymentRecordStatus.PAYMENT_INITIATED,
    };

    paymentsRepo.findOne.mockResolvedValue(mockPayment);

    jest.spyOn(chapaService, 'verifyTransaction').mockResolvedValue({
      success: false,
      status: 'failed',
      txRef,
      amount: 200,
      currency: 'ETB',
      message: 'Insufficient balance',
    });

    const body = { tx_ref: txRef, status: 'failed' };
    const signature = signPayload(body);

    const result = await paymentsService.processChapaWebhook(body, {
      'x-chapa-signature': signature,
    });

    expect(result.received).toBe(false);
    expect(paymentsRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        status: PaymentRecordStatus.FAILED,
      }),
    );
    expect(queryRunner.startTransaction).not.toHaveBeenCalled();
    expect(receiptsRepo.create).not.toHaveBeenCalled();
  });

  // ─── 3. Invalid webhook signature ────────────────────────────────────────
  it('3. Invalid webhook signature: rejects without modifying database', async () => {
    const body = { tx_ref: 'PAY-ANY' };
    const invalidSignature = 'invalid_tampered_hmac_hex';

    const result = await paymentsService.processChapaWebhook(body, {
      'x-chapa-signature': invalidSignature,
    });

    expect(result.received).toBe(false);
    expect(result.message).toBe('Invalid webhook signature');
    expect(paymentsRepo.findOne).not.toHaveBeenCalled();
  });

  // ─── 4. Fake transaction reference ───────────────────────────────────────
  it('4. Fake transaction reference: returns Payment record not found', async () => {
    paymentsRepo.findOne.mockResolvedValue(null);

    const body = { tx_ref: 'PAY-FAKE-999999' };
    const signature = signPayload(body);

    const result = await paymentsService.processChapaWebhook(body, {
      'x-chapa-signature': signature,
    });

    expect(result.received).toBe(false);
    expect(result.message).toBe('Payment record not found');
  });

  // ─── 5. Amount mismatch ──────────────────────────────────────────────────
  it('5. Amount mismatch: gateway charged different amount -> fails payment, order NOT paid', async () => {
    const txRef = 'PAY-1725800000000-5';
    const mockPayment: Partial<Payment> = {
      id: 5,
      paymentNumber: txRef,
      orderId: 105,
      amount: 500, // DB expects 500
      currency: 'ETB',
      status: PaymentRecordStatus.PAYMENT_INITIATED,
    };

    paymentsRepo.findOne.mockResolvedValue(mockPayment);

    jest.spyOn(chapaService, 'verifyTransaction').mockResolvedValue({
      success: true,
      status: 'success',
      txRef,
      amount: 100, // Mismatched 100!
      currency: 'ETB',
    });

    const body = { tx_ref: txRef, status: 'success' };
    const signature = signPayload(body);

    const result = await paymentsService.processChapaWebhook(body, {
      'x-chapa-signature': signature,
    });

    expect(result.received).toBe(false);
    expect(result.message).toContain('Amount mismatch');
    expect(paymentsRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        status: PaymentRecordStatus.FAILED,
      }),
    );
    expect(queryRunner.startTransaction).not.toHaveBeenCalled();
  });

  // ─── 6. Currency mismatch ────────────────────────────────────────────────
  it('6. Currency mismatch: gateway used USD instead of ETB -> rejected', async () => {
    const txRef = 'PAY-1725800000000-6';
    const mockPayment: Partial<Payment> = {
      id: 6,
      paymentNumber: txRef,
      orderId: 106,
      amount: 300,
      currency: 'ETB',
      status: PaymentRecordStatus.PAYMENT_INITIATED,
    };

    paymentsRepo.findOne.mockResolvedValue(mockPayment);

    jest.spyOn(chapaService, 'verifyTransaction').mockResolvedValue({
      success: true,
      status: 'success',
      txRef,
      amount: 300,
      currency: 'USD', // Mismatched USD!
    });

    const body = { tx_ref: txRef, status: 'success' };
    const signature = signPayload(body);

    const result = await paymentsService.processChapaWebhook(body, {
      'x-chapa-signature': signature,
    });

    expect(result.received).toBe(false);
    expect(result.message).toContain('Currency mismatch');
  });

  // ─── 7. Duplicate webhook (Idempotency) ──────────────────────────────────
  it('7. Duplicate webhook: returns 200 immediately without reprocessing', async () => {
    const txRef = 'PAY-1725800000000-7';
    const mockPayment: Partial<Payment> = {
      id: 7,
      paymentNumber: txRef,
      orderId: 107,
      amount: 300,
      currency: 'ETB',
      status: PaymentRecordStatus.PAID, // Already PAID!
    };

    paymentsRepo.findOne.mockResolvedValue(mockPayment);
    receiptsRepo.findOne.mockResolvedValue({
      id: 70,
      receiptNumber: 'REC-EXISTING-7',
      orderId: 107,
    });

    const body = { tx_ref: txRef, status: 'success' };
    const signature = signPayload(body);

    const result = await paymentsService.processChapaWebhook(body, {
      'x-chapa-signature': signature,
    });

    expect(result.received).toBe(true);
    expect(result.message).toContain('already processed');
    expect(result.receiptNumber).toBe('REC-EXISTING-7');
    expect(queryRunner.startTransaction).not.toHaveBeenCalled();
  });

  // ─── 8. Duplicate receipt prevention ────────────────────────────────────
  it('8. Duplicate receipt prevention: createReceipt returns existing receipt if already generated', async () => {
    const mockOrder = {
      id: 88,
      orderNumber: 'ORD-88',
      total: 250,
      subtotal: 217.4,
      tax: 32.6,
      deliveryFee: 0,
      customerName: 'Abebe',
      customerEmail: 'abebe@example.com',
      items: [],
    } as any;

    const mockPayment = {
      id: 888,
      paymentMethod: 'telebirr',
      currency: 'ETB',
    } as any;

    const existingReceipt = {
      id: 999,
      receiptNumber: 'REC-ORIGINAL-88',
      orderId: 88,
    } as any;

    receiptsRepo.findOne.mockResolvedValue(existingReceipt);

    const receipt = await receiptsService.createReceipt(mockOrder, mockPayment);

    expect(receipt.receiptNumber).toBe('REC-ORIGINAL-88');
    expect(receiptsRepo.create).not.toHaveBeenCalled();
  });

  // ─── 9. Another user's order ─────────────────────────────────────────────
  it('9. Another users order: 403 ForbiddenException on initialization', async () => {
    ordersRepo.findOne.mockResolvedValue({
      id: 99,
      customerId: 999, // Customer is 999
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      total: 100,
    });

    await expect(
      paymentsService.initiatePayment(
        { orderId: 99, paymentMethod: PaymentProviderMethod.TELEBIRR },
        42, // Authenticated user is 42
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  // ─── 10. Fake frontend amount ────────────────────────────────────────────
  it('10. Fake frontend amount ignored: DB order total is strictly used', async () => {
    ordersRepo.findOne.mockResolvedValue({
      id: 100,
      orderNumber: 'ORD-100',
      customerId: 42,
      customerName: 'Abebe',
      customerEmail: 'abebe@example.com',
      total: 850.5, // Real total in DB
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
    });

    jest.spyOn(chapaService, 'initializeTransaction').mockResolvedValue({
      success: true,
      checkoutUrl: 'https://checkout.chapa.co/test',
      chapaReference: 'PAY-100',
    });

    const result = await paymentsService.initiatePayment(
      { orderId: 100, paymentMethod: PaymentProviderMethod.TELEBIRR, amount: 1 } as any,
      42,
    );

    expect(result.amount).toBe(850.5); // Database amount strictly enforced
  });

  // ─── 11. Already-paid order ──────────────────────────────────────────────
  it('11. Already-paid order: rejects initialization with BadRequestException', async () => {
    ordersRepo.findOne.mockResolvedValue({
      id: 101,
      customerId: 42,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PAID, // Already paid!
      total: 100,
    });

    await expect(
      paymentsService.initiatePayment(
        { orderId: 101, paymentMethod: PaymentProviderMethod.TELEBIRR },
        42,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  // ─── 12. Chapa API failure ───────────────────────────────────────────────
  it('12. Chapa API failure: network error during verify handled safely, order NOT marked paid', async () => {
    const txRef = 'PAY-1725800000000-12';
    paymentsRepo.findOne.mockResolvedValue({
      id: 12,
      paymentNumber: txRef,
      orderId: 112,
      amount: 150,
      currency: 'ETB',
      status: PaymentRecordStatus.PAYMENT_INITIATED,
    });

    jest.spyOn(chapaService, 'verifyTransaction').mockResolvedValue({
      success: false,
      message: 'Gateway verification request failed',
    });

    const body = { tx_ref: txRef };
    const signature = signPayload(body);

    const result = await paymentsService.processChapaWebhook(body, {
      'x-chapa-signature': signature,
    });

    expect(result.received).toBe(false);
    expect(queryRunner.startTransaction).not.toHaveBeenCalled();
  });

  // ─── 13. Customer sees receipt ───────────────────────────────────────────
  it('13. Customer sees receipt: owner can view receipt; non-owner gets 403 Forbidden', async () => {
    const mockReceipt = {
      id: 13,
      receiptNumber: 'REC-13',
      orderId: 113,
      customerEmail: 'owner@example.com',
      order: { customerId: 42, customerEmail: 'owner@example.com' },
    } as any;

    receiptsRepo.findOne.mockResolvedValue(mockReceipt);

    // Owner (user.sub = 42) succeeds
    const ownerView = await receiptsController.findByOrderId('113', {
      sub: '42',
      email: 'owner@example.com',
      role: 'customer',
    } as any);
    expect(ownerView.receiptNumber).toBe('REC-13');

    // Intruder (user.sub = 999) gets 403 Forbidden
    await expect(
      receiptsController.findByOrderId('113', {
        sub: '999',
        email: 'intruder@example.com',
        role: 'customer',
      } as any),
    ).rejects.toThrow(ForbiddenException);
  });

  // ─── 14. Admin sees PAID order ───────────────────────────────────────────
  it('14. Admin sees PAID order: staff user can access receipt without customer restriction', async () => {
    const mockReceipt = {
      id: 14,
      receiptNumber: 'REC-ADMIN-14',
      orderId: 114,
      customerEmail: 'customer@example.com',
      order: { customerId: 99, customerEmail: 'customer@example.com' },
    } as any;

    receiptsRepo.findOne.mockResolvedValue(mockReceipt);

    const adminView = await receiptsController.findByOrderId('114', {
      sub: '1',
      email: 'admin@michu.et',
      role: 'admin',
    } as any);

    expect(adminView.receiptNumber).toBe('REC-ADMIN-14');
  });
});
