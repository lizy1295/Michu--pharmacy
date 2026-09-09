import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { PaymentsService } from './payments.service';
import { Payment, PaymentRecordStatus } from './entities/payment.entity';
import { Order, OrderStatus, PaymentStatus } from '../orders/entities/order.entity';
import { Product } from '../products/product.entity';
import { TelebirrService } from './services/telebirr.service';
import { CbeService } from './services/cbe.service';
import { ChapaService } from './services/chapa.service';
import { ReceiptsService } from '../receipts/receipts.service';
import { PaymentProviderMethod } from './entities/payment.entity';

describe('PaymentsService - Phase 2', () => {
  let service: PaymentsService;
  let ordersRepo: any;
  let paymentsRepo: any;
  let chapaService: any;

  beforeEach(async () => {
    ordersRepo = {
      findOne: jest.fn(),
      save: jest.fn().mockImplementation((order) => Promise.resolve(order)),
    };

    paymentsRepo = {
      create: jest.fn().mockImplementation((data) => ({ id: 99, ...data })),
      save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 99, ...data })),
      findOne: jest.fn(),
    };

    chapaService = {
      initializeTransaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: getRepositoryToken(Payment), useValue: paymentsRepo },
        { provide: getRepositoryToken(Order), useValue: ordersRepo },
        { provide: getRepositoryToken(Product), useValue: {} },
        { provide: TelebirrService, useValue: {} },
        { provide: CbeService, useValue: {} },
        { provide: ChapaService, useValue: chapaService },
        { provide: ReceiptsService, useValue: { createReceipt: jest.fn(), findByOrderId: jest.fn() } },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultVal?: string) => {
              if (key === 'CORS_ORIGIN') return 'http://localhost:3000';
              if (key === 'API_BASE_URL') return 'http://localhost:3001/api/v1';
              return defaultVal;
            }),
          },
        },
        { provide: DataSource, useValue: {} },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  it('1. valid authenticated order: initializes Chapa and returns payment details', async () => {
    const mockOrder: Partial<Order> = {
      id: 1,
      orderNumber: 'ORD-001',
      customerId: 42,
      customerName: 'Abebe Bikila',
      customerEmail: 'abebe@example.com',
      total: 350.5,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
    };

    ordersRepo.findOne.mockResolvedValue(mockOrder);
    chapaService.initializeTransaction.mockResolvedValue({
      success: true,
      checkoutUrl: 'https://checkout.chapa.co/checkout/payment/PAY-123',
      chapaReference: 'PAY-123',
    });

    const result = await service.initiatePayment(
      { orderId: 1, paymentMethod: PaymentProviderMethod.TELEBIRR },
      42,
    );

    expect(result).toBeDefined();
    expect(result.amount).toBe(350.5);
    expect(result.checkoutUrl).toBe('https://checkout.chapa.co/checkout/payment/PAY-123');
    expect(result.status).toBe(PaymentRecordStatus.PAYMENT_INITIATED);
    expect(result.paymentMethod).toBe(PaymentProviderMethod.TELEBIRR);
    expect(mockOrder.paymentStatus).toBe(PaymentStatus.PAYMENT_INITIATED);
    expect(mockOrder.paymentMethod).toBe(PaymentProviderMethod.TELEBIRR);
  });

  it('2. another users order: throws 403 ForbiddenException', async () => {
    const mockOrder: Partial<Order> = {
      id: 2,
      orderNumber: 'ORD-002',
      customerId: 999, // Owned by user 999
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      total: 200,
    };

    ordersRepo.findOne.mockResolvedValue(mockOrder);

    await expect(
      service.initiatePayment(
        { orderId: 2, paymentMethod: PaymentProviderMethod.TELEBIRR },
        42, // Authenticated user is 42
      ),
    ).rejects.toThrow(ForbiddenException);

    expect(chapaService.initializeTransaction).not.toHaveBeenCalled();
  });

  it('3. missing order: throws 404 NotFoundException', async () => {
    ordersRepo.findOne.mockResolvedValue(null);

    await expect(
      service.initiatePayment(
        { orderId: 9999, paymentMethod: PaymentProviderMethod.TELEBIRR },
        42,
      ),
    ).rejects.toThrow(NotFoundException);

    expect(chapaService.initializeTransaction).not.toHaveBeenCalled();
  });

  it('4. fake frontend amount ignored: DB order total is strictly used', async () => {
    const mockOrder: Partial<Order> = {
      id: 3,
      orderNumber: 'ORD-003',
      customerId: 42,
      customerName: 'Abebe Bikila',
      customerEmail: 'abebe@example.com',
      total: 500, // REAL DB total
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
    };

    ordersRepo.findOne.mockResolvedValue(mockOrder);
    chapaService.initializeTransaction.mockResolvedValue({
      success: true,
      checkoutUrl: 'https://checkout.chapa.co/checkout/payment/PAY-REAL',
      chapaReference: 'PAY-REAL',
    });

    // Even if frontend somehow passed amount: 1 in raw object
    const dtoWithFakeAmount = {
      orderId: 3,
      paymentMethod: PaymentProviderMethod.TELEBIRR,
      amount: 1,
    } as any;

    const result = await service.initiatePayment(dtoWithFakeAmount, 42);

    expect(result.amount).toBe(500); // Must be 500 from DB, NOT 1
    expect(chapaService.initializeTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 500,
      }),
    );
  });

  it('5. already-paid order rejected: throws BadRequestException', async () => {
    const mockOrder: Partial<Order> = {
      id: 4,
      orderNumber: 'ORD-004',
      customerId: 42,
      total: 100,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PAID, // Already paid!
    };

    ordersRepo.findOne.mockResolvedValue(mockOrder);

    await expect(
      service.initiatePayment(
        { orderId: 4, paymentMethod: PaymentProviderMethod.TELEBIRR },
        42,
      ),
    ).rejects.toThrow(BadRequestException);

    expect(chapaService.initializeTransaction).not.toHaveBeenCalled();
  });

  it('6. cancelled order rejected: throws BadRequestException', async () => {
    const mockOrder: Partial<Order> = {
      id: 5,
      orderNumber: 'ORD-005',
      customerId: 42,
      total: 100,
      status: OrderStatus.CANCELLED, // Cancelled!
      paymentStatus: PaymentStatus.PENDING,
    };

    ordersRepo.findOne.mockResolvedValue(mockOrder);

    await expect(
      service.initiatePayment(
        { orderId: 5, paymentMethod: PaymentProviderMethod.TELEBIRR },
        42,
      ),
    ).rejects.toThrow(BadRequestException);

    expect(chapaService.initializeTransaction).not.toHaveBeenCalled();
  });

  it('7. Chapa failure does not mark order PAID', async () => {
    const mockOrder: Partial<Order> = {
      id: 6,
      orderNumber: 'ORD-006',
      customerId: 42,
      customerName: 'Abebe Bikila',
      customerEmail: 'abebe@example.com',
      total: 150,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
    };

    ordersRepo.findOne.mockResolvedValue(mockOrder);
    chapaService.initializeTransaction.mockResolvedValue({
      success: false,
      message: 'Gateway network error',
    });

    await expect(
      service.initiatePayment(
        { orderId: 6, paymentMethod: PaymentProviderMethod.TELEBIRR },
        42,
      ),
    ).rejects.toThrow(BadRequestException);

    // Verify order was NEVER marked PAID
    expect(mockOrder.paymentStatus).toBe(PaymentStatus.PENDING);
    expect(ordersRepo.save).not.toHaveBeenCalled();

    // Verify payment record was saved as PENDING (not SUCCESS/PAID)
    expect(paymentsRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        status: PaymentRecordStatus.PENDING,
      }),
    );
  });
});
