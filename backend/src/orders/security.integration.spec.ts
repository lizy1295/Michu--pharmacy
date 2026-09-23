/**
 * security.integration.spec.ts
 *
 * Security-critical integration tests (section 3 of the testing guide).
 * All four scenarios use mocked repositories — no live database required.
 *
 * Scenarios:
 *  1. Unauthenticated GET /orders returns 401
 *  2. Customer A requesting Customer B's order via GET /orders/:id returns 403
 *  3. An order with a prescription item cannot move to "shipped" while
 *     the linked prescription is still PENDING
 *  4. A payment webhook without valid signature verification is rejected
 */

import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  ExecutionContext,
  ForbiddenException,
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

// ── Payments ─────────────────────────────────────────────────────────────────
import { PaymentsController } from '../payments/payments.controller';
import { PaymentsService } from '../payments/payments.service';
import { Payment, PaymentProviderMethod, PaymentRecordStatus } from '../payments/entities/payment.entity';
import { TelebirrService } from '../payments/services/telebirr.service';
import { CbeService } from '../payments/services/cbe.service';
import { ChapaService } from '../payments/services/chapa.service';
import { ReceiptsService } from '../receipts/receipts.service';
import { Receipt } from '../receipts/entities/receipt.entity';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { ProductsService } from '../products/products.service';
import { ProductsController } from '../products/products.controller';

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
// SHARED MOCK DATA
// ---------------------------------------------------------------------------

/** Customer A — the authenticated user in most tests */
const CUSTOMER_A = { sub: '100', role: 'customer', email: 'alice@example.com' };

/** Customer B — owns order #999 */
const CUSTOMER_B = { sub: '200', role: 'customer', email: 'bob@example.com' };

const STAFF_USER = { sub: '1', role: STAFF_ROLES[0], email: 'admin@michu.com' };

// ---------------------------------------------------------------------------
// SCENARIO 1 & 2  (Orders Controller — HTTP layer)
// ---------------------------------------------------------------------------

describe('Security: Orders auth enforcement', () => {
  let app: INestApplication;

  // Mutable so each test can swap the "logged-in" user; null = unauthenticated
  let currentUser: typeof CUSTOMER_A | null = CUSTOMER_A;

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

  beforeAll(async () => {
    const mockOrderRepo = {
      count: jest.fn().mockResolvedValue(1),
      findOne: jest.fn().mockImplementation(({ where }: any) => {
        if (where?.id === 999) return Promise.resolve({ ...orderOwnedByB });
        return Promise.resolve(null);
      }),
      create: jest.fn().mockImplementation((d: any) => ({ id: 1, ...d })),
      save: jest.fn().mockImplementation((d: any) => Promise.resolve(d)),
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
      findOne: jest.fn().mockResolvedValue(null),
      findAndCount: jest.fn().mockResolvedValue([[], 0]),
      createQueryBuilder: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      }),
    };

    const mockOrderItemRepo = {
      save: jest.fn().mockResolvedValue([]),
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
          if (!currentUser) return false; // simulate 401
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

  // ── Scenario 1 ─────────────────────────────────────────────────────────────

  describe('Scenario 1: Unauthenticated GET /orders returns 401', () => {
    it('returns 401 when no JWT is provided', async () => {
      currentUser = null;
      await request(app.getHttpServer()).get('/orders').expect(401);
      currentUser = CUSTOMER_A;
    });

    it('returns 403 when an authenticated customer (non-staff) requests GET /orders', async () => {
      currentUser = CUSTOMER_A;
      await request(app.getHttpServer()).get('/orders').expect(403);
    });
  });

  // ── Scenario 2 ─────────────────────────────────────────────────────────────

  describe("Scenario 2: Customer A cannot read Customer B's order (403)", () => {
    it('returns 403 when Customer A requests GET /orders/999 (owned by Customer B)', async () => {
      currentUser = CUSTOMER_A;
      const res = await request(app.getHttpServer()).get('/orders/999').expect(403);
      expect(res.body.message).toMatch(/not authorized/i);
    });

    it('returns 200 when Customer B requests their own order', async () => {
      currentUser = CUSTOMER_B;
      const res = await request(app.getHttpServer()).get('/orders/999').expect(200);
      expect(res.body.id).toBe(999);
      expect(res.body.customerEmail).toBe(CUSTOMER_B.email);
    });

    it('staff can read any order regardless of ownership', async () => {
      currentUser = STAFF_USER;
      const res = await request(app.getHttpServer()).get('/orders/999').expect(200);
      expect(res.body.id).toBe(999);
    });
  });
});

// ---------------------------------------------------------------------------
// SCENARIO 3  (OrdersService — unit level)
// ---------------------------------------------------------------------------

describe('Scenario 3: Cannot ship order while prescription is PENDING', () => {
  let ordersService: OrdersService;

  const prescriptionItem = {
    id: 1, productId: 10, name: 'Amoxicillin 500mg',
    quantity: 2, price: 80, prescriptionRequired: true,
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
          ? { id: 1, prescriptionNumber: 'RX-2024-001', patientEmail: 'alice@example.com', status: PrescriptionStatus.PENDING }
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

  it('throws when attempting to ship while prescription is PENDING', async () => {
    const module = await buildServiceModule(true);
    ordersService = module.get<OrdersService>(OrdersService);

    await expect(
      ordersService.updateStatus(42, { status: OrderStatus.SHIPPED }),
    ).rejects.toThrow(/prescription.*PENDING/i);
  });

  it('does NOT block transitioning to APPROVED (non-shipping transition)', async () => {
    const module = await buildServiceModule(true);
    ordersService = module.get<OrdersService>(OrdersService);

    await expect(
      ordersService.updateStatus(42, { status: OrderStatus.APPROVED }),
    ).resolves.toBeDefined();
  });

  it('allows shipping when no PENDING prescription is found for the customer', async () => {
    const module = await buildServiceModule(false);
    ordersService = module.get<OrdersService>(OrdersService);

    await expect(
      ordersService.updateStatus(42, { status: OrderStatus.SHIPPED }),
    ).resolves.toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// SCENARIO 4  (Payments webhook — service + HTTP)
// ---------------------------------------------------------------------------

describe('Scenario 4: Payment webhook rejects invalid signatures', () => {
  let app: INestApplication;
  let paymentsService: PaymentsService;

  const validTxRef = 'PAY-1725800000000-99';
  const validWebhookBody = { tx_ref: validTxRef, status: 'success' };

  const mockPayment: Partial<Payment> = {
    id: 10, paymentNumber: validTxRef, orderId: 500,
    amount: 300, currency: 'ETB',
    status: PaymentRecordStatus.PAYMENT_INITIATED,
    paymentMethod: PaymentProviderMethod.TELEBIRR,
  };

  const mockOrder: Partial<Order> = {
    id: 500, orderNumber: 'ORD-0500',
    customerId: 100, customerEmail: 'alice@example.com',
    total: 300, subtotal: 260, tax: 40, deliveryFee: 0,
    status: OrderStatus.APPROVED,
    paymentStatus: PaymentStatus.PAYMENT_INITIATED,
    items: [],
  };

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
      save: jest.fn().mockImplementation((e: any) => Promise.resolve(e)),
      getRepository: jest.fn().mockReturnValue({
        findOne: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockImplementation((d: any) => ({ id: 50, receiptNumber: 'REC-0050', ...d })),
        save: jest.fn().mockImplementation((d: any) => Promise.resolve({ id: 50, receiptNumber: 'REC-0050', ...d })),
      }),
    },
  };

  beforeAll(async () => {
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
            findByOrderId: jest.fn().mockResolvedValue({ id: 50, receiptNumber: 'REC-0050' }),
          },
        },
        {
          provide: getRepositoryToken(Payment),
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockPayment),
            create: jest.fn().mockImplementation((d: any) => ({ id: 10, ...d })),
            save: jest.fn().mockImplementation((d: any) => Promise.resolve(d)),
          },
        },
        {
          provide: getRepositoryToken(Order),
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockOrder),
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
      success: true, status: 'success', txRef: validTxRef,
      reference: 'CHAPA-REF-999', amount: 300, currency: 'ETB',
    } as any);

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    paymentsService = module.get<PaymentsService>(PaymentsService);
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('4a. Missing x-chapa-signature header is rejected with ForbiddenException', async () => {
    await expect(
      paymentsService.processChapaWebhook(validWebhookBody, {}),
    ).rejects.toThrow(ForbiddenException);
  });

  it('4b. Wrong (tampered) signature is rejected with ForbiddenException', async () => {
    const wrongSig = crypto
      .createHmac('sha256', 'wrong_secret')
      .update(JSON.stringify(validWebhookBody))
      .digest('hex');

    await expect(
      paymentsService.processChapaWebhook(validWebhookBody, {
        'x-chapa-signature': wrongSig,
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('4c. Correct HMAC signature is accepted and returns success', async () => {
    const correctSig = signPayload(validWebhookBody);

    const result = await paymentsService.processChapaWebhook(validWebhookBody, {
      'x-chapa-signature': correctSig,
    });

    expect(result.received).toBe(true);
  });

  it('4d. HTTP POST /payments/webhook/chapa without signature returns 4xx', async () => {
    const res = await request(app.getHttpServer())
      .post('/payments/webhook/chapa')
      .send(validWebhookBody);

    expect([400, 403]).toContain(res.status);
  });
});



