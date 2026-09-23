/**
 * security.integration.spec.ts
 *
 * Security-critical integration and service-level tests verifying core platform security rules:
 *
 * Rule 1: An unauthenticated request to GET /orders returns 401 Unauthorized.
 * Rule 2: An authenticated Customer A requesting Customer B's order via GET /orders/:id returns 403 Forbidden.
 * Rule 3: A customer-role token hitting an admin-only route (e.g. PATCH /products/:id, PATCH /orders/:id/status) returns 403 Forbidden.
 * Rule 4: POST /orders ignores any "total" or "price" field sent in the request body and always uses the server-computed value from the product catalogue.
 * Rule 5: A payment webhook without a valid signature/verification is rejected, not processed, and does not mark any order as paid.
 * Rule 6: An order containing a prescription item cannot transition to a "shipped" or "fulfilled" (completed) status while its linked prescription is still PENDING.
 */

import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as crypto from 'crypto';
const request = require('supertest');

// ── Orders ───────────────────────────────────────────────────────────────────
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order, OrderStatus, PaymentStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/product.entity';

// ── Prescriptions ─────────────────────────────────────────────────────────────
import {
  Prescription,
  PrescriptionStatus,
} from '../prescriptions/entities/prescription.entity';

// ── Auth guards ──────────────────────────────────────────────────────────────
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

// ── Products ─────────────────────────────────────────────────────────────────
import { ProductsService } from '../products/products.service';
import { ProductsController } from '../products/products.controller';

// ── Payments ─────────────────────────────────────────────────────────────────
import { PaymentsController } from '../payments/payments.controller';
import { PaymentsService } from '../payments/payments.service';
import { Payment, PaymentProviderMethod, PaymentRecordStatus } from '../payments/entities/payment.entity';
import { TelebirrService } from '../payments/services/telebirr.service';
import { CbeService } from '../payments/services/cbe.service';
import { ChapaService } from '../payments/services/chapa.service';
import { ReceiptsService } from '../receipts/receipts.service';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

// ── Shared ────────────────────────────────────────────────────────────────────
import { STAFF_ROLES } from '@michu/shared';

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

const WEBHOOK_SECRET = 'test_webhook_secret_abc123';

function signPayload(payload: object): string {
  const str = JSON.stringify(payload);
  return crypto.createHmac('sha256', WEBHOOK_SECRET).update(str).digest('hex');
}

// ---------------------------------------------------------------------------
// TEST SUITE: RULES 1, 2, 3 & 4 (Orders & Products HTTP / Controller Layer)
// ---------------------------------------------------------------------------

describe('Security Rules: Auth Enforcement & Catalog Pricing (HTTP Layer)', () => {
  let app: INestApplication;

  const CUSTOMER_A = { sub: '100', role: 'customer', email: 'alice@example.com' };
  const CUSTOMER_B = { sub: '200', role: 'customer', email: 'bob@example.com' };
  const STAFF_USER = { sub: '1', role: STAFF_ROLES[0], email: 'admin@michu.com' };

  let currentUser: typeof CUSTOMER_A | null = CUSTOMER_A;

  const catalogProduct: Partial<Product> = {
    id: 1,
    name: 'Amoxicillin 500mg',
    price: 80,
    brand: 'Bayer',
    category: 'Antibiotics',
    prescriptionRequired: true,
    stock: 50,
  };

  const orderOwnedByB: Partial<Order> = {
    id: 999,
    orderNumber: 'ORD-0999',
    customerId: Number(CUSTOMER_B.sub),
    customerEmail: CUSTOMER_B.email,
    status: OrderStatus.PENDING,
    paymentStatus: PaymentStatus.PENDING,
    total: 100,
    subtotal: 90,
    tax: 10,
    deliveryFee: 0,
    items: [],
  };

  let createdOrders: Order[] = [];
  let orderCounter = 1000;

  beforeAll(async () => {
    const mockOrderRepo = {
      count: jest.fn().mockImplementation(() => Promise.resolve(createdOrders.length + 1)),
      findOne: jest.fn().mockImplementation(({ where }: any) => {
        if (where?.id === 999) return Promise.resolve({ ...orderOwnedByB });
        const found = createdOrders.find((o) => o.id === where?.id);
        if (found) return Promise.resolve({ ...found });
        return Promise.resolve(null);
      }),
      create: jest.fn().mockImplementation((dto: any) => ({
        id: ++orderCounter,
        ...dto,
      })),
      save: jest.fn().mockImplementation((order: any) => {
        createdOrders.push(order);
        return Promise.resolve(order);
      }),
      createQueryBuilder: jest.fn().mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[orderOwnedByB], 1]),
      }),
    };

    const mockProductRepo = {
      findOne: jest.fn().mockImplementation(({ where }: any) => {
        if (where?.id === 1) return Promise.resolve({ ...catalogProduct });
        return Promise.resolve(null);
      }),
      findAndCount: jest.fn().mockResolvedValue([[catalogProduct], 1]),
      save: jest.fn().mockImplementation((p: any) => Promise.resolve({ ...p })),
      createQueryBuilder: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[catalogProduct], 1]),
      }),
    };

    const mockOrderItemRepo = {
      save: jest.fn().mockImplementation((items) => Promise.resolve(items)),
      find: jest.fn().mockResolvedValue([]),
    };

    const mockPrescriptionRepo = {
      createQueryBuilder: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController, ProductsController],
      providers: [
        OrdersService,
        ProductsService,
        { provide: getRepositoryToken(Order), useValue: mockOrderRepo },
        { provide: getRepositoryToken(OrderItem), useValue: mockOrderItemRepo },
        { provide: getRepositoryToken(Product), useValue: mockProductRepo },
        { provide: getRepositoryToken(Prescription), useValue: mockPrescriptionRepo },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          if (!currentUser) {
            throw new UnauthorizedException('Authentication token is missing or invalid.');
          }
          const req = context.switchToHttp().getRequest();
          req.user = currentUser;
          return true;
        },
      })
      .overrideGuard(RolesGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          return !!(req.user && STAFF_ROLES.includes(req.user.role));
        },
      })
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  // ── Rule 1 ─────────────────────────────────────────────────────────────────
  describe('Rule 1: Unauthenticated request to GET /orders returns 401 Unauthorized', () => {
    it('returns 401 Unauthorized when no auth token is provided', async () => {
      currentUser = null;
      await request(app.getHttpServer()).get('/orders').expect(401);
      currentUser = CUSTOMER_A;
    });
  });

  // ── Rule 2 ─────────────────────────────────────────────────────────────────
  describe("Rule 2: Authenticated Customer A requesting Customer B's order via GET /orders/:id returns 403 Forbidden", () => {
    it('returns 403 Forbidden when Customer A requests order #999 owned by Customer B', async () => {
      currentUser = CUSTOMER_A;
      const res = await request(app.getHttpServer()).get('/orders/999').expect(403);
      expect(res.body.message).toMatch(/not authorized/i);
    });

    it('allows Customer B (the owner) to retrieve their own order with 200 OK', async () => {
      currentUser = CUSTOMER_B;
      const res = await request(app.getHttpServer()).get('/orders/999').expect(200);
      expect(res.body.id).toBe(999);
      expect(res.body.customerEmail).toBe(CUSTOMER_B.email);
    });

    it('allows staff users to retrieve any order regardless of ownership with 200 OK', async () => {
      currentUser = STAFF_USER;
      const res = await request(app.getHttpServer()).get('/orders/999').expect(200);
      expect(res.body.id).toBe(999);
    });
  });

  // ── Rule 3 ─────────────────────────────────────────────────────────────────
  describe('Rule 3: Customer-role token hitting an admin-only route returns 403 Forbidden', () => {
    it('returns 403 Forbidden when Customer A hits staff-only GET /orders', async () => {
      currentUser = CUSTOMER_A;
      await request(app.getHttpServer()).get('/orders').expect(403);
    });

    it('returns 403 Forbidden when Customer A attempts to update product via PATCH /products/:id', async () => {
      currentUser = CUSTOMER_A;
      await request(app.getHttpServer())
        .patch('/products/1')
        .send({ price: 10 })
        .expect(403);
    });

    it('returns 403 Forbidden when Customer A attempts to update order status via PATCH /orders/:id/status', async () => {
      currentUser = CUSTOMER_A;
      await request(app.getHttpServer())
        .patch('/orders/999/status')
        .send({ status: OrderStatus.SHIPPED })
        .expect(403);
    });

    it('allows staff user to access admin-only routes', async () => {
      currentUser = STAFF_USER;
      await request(app.getHttpServer()).get('/orders').expect(200);
    });
  });

  // ── Rule 4 ─────────────────────────────────────────────────────────────────
  describe('Rule 4: POST /orders ignores client "total" or "price" fields and uses server-computed catalogue price', () => {
    it('overrides client-tampered price and total with authoritative product catalogue calculation', async () => {
      currentUser = CUSTOMER_A;

      // Product 1 has price = 80 in catalog.
      // Client tampers with price: 1 (instead of 80), subtotal: 3, total: 3.
      const tamperedPayload = {
        customerName: 'Alice Tamperer',
        customerEmail: 'alice@example.com',
        customerPhone: '+251911223344',
        shippingAddress: 'Bole Road, Addis Ababa',
        items: [
          {
            id: 1,
            name: 'Amoxicillin 500mg',
            price: 1.0, // FAKE tampered price!
            quantity: 3,
            prescriptionRequired: true,
          },
        ],
        subtotal: 3.0, // FAKE tampered subtotal!
        tax: 36,
        deliveryFee: 50,
      };

      const res = await request(app.getHttpServer())
        .post('/orders')
        .send(tamperedPayload)
        .expect(201);

      // Server computation: 3 units * 80 ETB catalog price = 240 ETB subtotal
      expect(res.body.subtotal).toBe(240);
      expect(res.body.subtotal).not.toBe(3.0);

      // Server computation: 240 + 36 (tax) + 50 (delivery) = 326 ETB total
      expect(res.body.total).toBe(326);
      expect(res.body.total).not.toBe(3.0);

      // Verify item price was set to catalog price 80, NOT tampered 1.0
      expect(res.body.items[0].price).toBe(80);
      expect(res.body.items[0].price).not.toBe(1.0);
    });
  });
});

// ---------------------------------------------------------------------------
// TEST SUITE: RULE 5 (Payment Webhook Signature & Order Paid Protection)
// ---------------------------------------------------------------------------

describe('Security Rule 5: Payment webhook signature rejection & order paid protection', () => {
  let app: INestApplication;
  let paymentsService: PaymentsService;

  const validTxRef = 'PAY-1725800000000-99';
  const validWebhookBody = { tx_ref: validTxRef, status: 'success' };

  let mockPayment: Partial<Payment>;
  let mockOrder: Partial<Order>;
  let savedEntities: any[] = [];

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      findOne: jest.fn().mockImplementation((entityClass: any) => {
        if (entityClass === Payment) return Promise.resolve({ ...mockPayment });
        if (entityClass === Order) return Promise.resolve({ ...mockOrder });
        return Promise.resolve(null);
      }),
      find: jest.fn().mockResolvedValue([]),
      save: jest.fn().mockImplementation((e: any) => {
        savedEntities.push(e);
        return Promise.resolve(e);
      }),
      getRepository: jest.fn().mockReturnValue({
        findOne: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockImplementation((d: any) => ({ id: 50, receiptNumber: 'REC-0050', ...d })),
        save: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 50, receiptNumber: 'REC-0050', ...d })),
      }),
    },
  };

  beforeAll(async () => {
    mockPayment = {
      id: 10,
      paymentNumber: validTxRef,
      orderId: 500,
      amount: 300,
      currency: 'ETB',
      status: PaymentRecordStatus.PAYMENT_INITIATED,
      paymentMethod: PaymentProviderMethod.TELEBIRR,
    };

    mockOrder = {
      id: 500,
      orderNumber: 'ORD-0500',
      customerId: 100,
      customerEmail: 'alice@example.com',
      total: 300,
      subtotal: 260,
      tax: 40,
      deliveryFee: 0,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PAYMENT_INITIATED,
      items: [],
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        PaymentsService,
        ChapaService,
        { provide: TelebirrService, useValue: { initiatePayment: jest.fn(), verifyPayment: jest.fn() } },
        { provide: CbeService, useValue: { initiatePayment: jest.fn(), verifyPayment: jest.fn() } },
        {
          provide: ReceiptsService,
          useValue: {
            createReceipt: jest.fn().mockResolvedValue({ id: 50, receiptNumber: 'REC-0050' }),
            findByOrderId: jest.fn().mockResolvedValue(null),
          },
        },
        {
          provide: getRepositoryToken(Payment),
          useValue: {
            findOne: jest.fn().mockImplementation(() => Promise.resolve(mockPayment)),
            create: jest.fn().mockImplementation((d: any) => ({ id: 10, ...d })),
            save: jest.fn().mockImplementation((d: any) => Promise.resolve(d)),
          },
        },
        {
          provide: getRepositoryToken(Order),
          useValue: {
            findOne: jest.fn().mockImplementation(() => Promise.resolve(mockOrder)),
            save: jest.fn().mockImplementation((d: any) => Promise.resolve(d)),
          },
        },
        { provide: getRepositoryToken(Product), useValue: { findOne: jest.fn() } },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, def?: string) => {
              if (key === 'CHAPA_WEBHOOK_SECRET') return WEBHOOK_SECRET;
              if (key === 'CHAPA_SECRET_KEY') return 'CHASECK_TEST-sample';
              if (key === 'CHAPA_BASE_URL') return 'https://api.chapa.co';
              return def;
            }),
          },
        },
        { provide: DataSource, useValue: { createQueryRunner: () => mockQueryRunner } },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    const chapaServiceInstance = module.get<ChapaService>(ChapaService);
    jest.spyOn(chapaServiceInstance, 'verifyTransaction').mockResolvedValue({
      success: true,
      status: 'success',
      txRef: validTxRef,
      reference: 'CHAPA-REF-999',
      amount: 300,
      currency: 'ETB',
    } as any);

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    paymentsService = module.get<PaymentsService>(PaymentsService);
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  beforeEach(() => {
    savedEntities = [];
    mockOrder.paymentStatus = PaymentStatus.PAYMENT_INITIATED;
    mockPayment.status = PaymentRecordStatus.PAYMENT_INITIATED;
    jest.clearAllMocks();
  });

  it('5a. Missing x-chapa-signature header is rejected with ForbiddenException and does not mark order as paid', async () => {
    await expect(
      paymentsService.processChapaWebhook(validWebhookBody, {}),
    ).rejects.toThrow(ForbiddenException);

    // Assert order was NOT marked as paid
    expect(mockOrder.paymentStatus).toBe(PaymentStatus.PAYMENT_INITIATED);
    expect(mockOrder.paymentStatus).not.toBe(PaymentStatus.PAID);
    expect(mockQueryRunner.commitTransaction).not.toHaveBeenCalled();
  });

  it('5b. Wrong/tampered signature is rejected with ForbiddenException and does not mark order as paid', async () => {
    const fakeSignature = crypto
      .createHmac('sha256', 'attacker_wrong_secret')
      .update(JSON.stringify(validWebhookBody))
      .digest('hex');

    await expect(
      paymentsService.processChapaWebhook(validWebhookBody, {
        'x-chapa-signature': fakeSignature,
      }),
    ).rejects.toThrow(ForbiddenException);

    // Assert order was NOT marked as paid
    expect(mockOrder.paymentStatus).toBe(PaymentStatus.PAYMENT_INITIATED);
    expect(mockOrder.paymentStatus).not.toBe(PaymentStatus.PAID);
    expect(mockQueryRunner.commitTransaction).not.toHaveBeenCalled();
  });

  it('5c. HTTP POST /payments/webhook/chapa without signature returns 403 Forbidden', async () => {
    await request(app.getHttpServer())
      .post('/payments/webhook/chapa')
      .send(validWebhookBody)
      .expect(403);

    expect(mockOrder.paymentStatus).not.toBe(PaymentStatus.PAID);
  });

  it('5d. Valid signature processes payment and marks order as PAID', async () => {
    const validSignature = signPayload(validWebhookBody);

    const result = await paymentsService.processChapaWebhook(validWebhookBody, {
      'x-chapa-signature': validSignature,
    });

    expect(result.received).toBe(true);
    expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// TEST SUITE: RULE 6 (Prescription-Item Transition Protection)
// ---------------------------------------------------------------------------

describe('Security Rule 6: Prescription-item orders cannot transition to shipped or fulfilled while prescription is PENDING', () => {
  let ordersService: OrdersService;

  const prescriptionItem = {
    id: 1,
    productId: 10,
    name: 'Amoxicillin 500mg',
    quantity: 2,
    price: 80,
    prescriptionRequired: true,
  };

  const pendingPrescriptionOrder: Partial<Order> = {
    id: 42,
    orderNumber: 'ORD-0042',
    customerId: 100,
    customerEmail: 'alice@example.com',
    status: OrderStatus.APPROVED,
    items: [prescriptionItem as any],
  };

  function buildServiceModule(pendingRxFound: boolean) {
    const rxQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(
        pendingRxFound
          ? {
              id: 1,
              prescriptionNumber: 'RX-2024-001',
              patientEmail: 'alice@example.com',
              status: PrescriptionStatus.PENDING,
            }
          : null,
      ),
    };

    return Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useValue: {
            findOne: jest.fn().mockResolvedValue({ ...pendingPrescriptionOrder }),
            save: jest.fn().mockImplementation((d: any) => Promise.resolve(d)),
          },
        },
        {
          provide: getRepositoryToken(OrderItem),
          useValue: { save: jest.fn().mockResolvedValue([]), find: jest.fn().mockResolvedValue([]) },
        },
        {
          provide: getRepositoryToken(Product),
          useValue: { findOne: jest.fn().mockResolvedValue(null) },
        },
        {
          provide: getRepositoryToken(Prescription),
          useValue: { createQueryBuilder: jest.fn().mockReturnValue(rxQueryBuilder) },
        },
      ],
    }).compile();
  }

  it('6a. Blocks transition to SHIPPED when linked prescription is PENDING', async () => {
    const module = await buildServiceModule(true);
    ordersService = module.get<OrdersService>(OrdersService);

    await expect(
      ordersService.updateStatus(42, { status: OrderStatus.SHIPPED }),
    ).rejects.toThrow(/prescription.*PENDING/i);
  });

  it('6b. Blocks transition to COMPLETED (fulfilled) when linked prescription is PENDING', async () => {
    const module = await buildServiceModule(true);
    ordersService = module.get<OrdersService>(OrdersService);

    await expect(
      ordersService.updateStatus(42, { status: OrderStatus.COMPLETED }),
    ).rejects.toThrow(/prescription.*PENDING/i);
  });

  it('6c. Allows transition to APPROVED (non-shipping/fulfilling transition) even if prescription is PENDING', async () => {
    const module = await buildServiceModule(true);
    ordersService = module.get<OrdersService>(OrdersService);

    await expect(
      ordersService.updateStatus(42, { status: OrderStatus.APPROVED }),
    ).resolves.toBeDefined();
  });

  it('6d. Allows transition to SHIPPED when linked prescription is no longer PENDING (e.g. approved)', async () => {
    const module = await buildServiceModule(false);
    ordersService = module.get<OrdersService>(OrdersService);

    const res = await ordersService.updateStatus(42, { status: OrderStatus.SHIPPED });
    expect(res.status).toBe(OrderStatus.SHIPPED);
  });

  it('6e. Allows transition to COMPLETED (fulfilled) when linked prescription is no longer PENDING', async () => {
    const module = await buildServiceModule(false);
    ordersService = module.get<OrdersService>(OrdersService);

    const res = await ordersService.updateStatus(42, { status: OrderStatus.COMPLETED });
    expect(res.status).toBe(OrderStatus.COMPLETED);
  });
});
