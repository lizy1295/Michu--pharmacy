import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, ExecutionContext } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
const request = require('supertest');
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { ProductsController } from '../products/products.controller';
import { ProductsService } from '../products/products.service';
import { Order, OrderStatus, PaymentStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/product.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('Orders and Products Integration Tests (POST /orders, GET /products)', () => {
  let app: INestApplication;

  // In-memory mock databases
  let mockProducts: Map<number, Product>;
  let mockOrders: Map<number, Order>;
  let orderIdCounter: number;

  beforeAll(async () => {
    mockProducts = new Map();
    mockOrders = new Map();
    orderIdCounter = 1;

    // Seed mock products
    const p1 = new Product();
    p1.id = 1;
    p1.name = 'Amoxicillin 500mg';
    p1.price = 80;
    p1.brand = 'Bayer';
    p1.category = 'Antibiotics';
    p1.prescriptionRequired = true;
    p1.stock = 50;
    mockProducts.set(1, p1);

    const p2 = new Product();
    p2.id = 2;
    p2.name = 'Paracetamol 500mg';
    p2.price = 45;
    p2.brand = 'GSK';
    p2.category = 'Analgesics';
    p2.prescriptionRequired = false;
    p2.stock = 2; // Limited stock for testing out-of-stock
    mockProducts.set(2, p2);

    const mockOrderRepo = {
      count: jest.fn().mockImplementation(() => Promise.resolve(mockOrders.size)),
      create: jest.fn().mockImplementation((dto) => ({
        id: ++orderIdCounter,
        orderNumber: `ORD-${String(orderIdCounter).padStart(4, '0')}`,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...dto,
      })),
      save: jest.fn().mockImplementation((order) => {
        mockOrders.set(order.id, order);
        return Promise.resolve(order);
      }),
      findOne: jest.fn().mockImplementation(({ where }) => {
        return Promise.resolve(mockOrders.get(where.id) || null);
      }),
      createQueryBuilder: jest.fn().mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockImplementation(() => {
          const list = Array.from(mockOrders.values());
          return Promise.resolve([list, list.length]);
        }),
      }),
    };

    const mockProductRepo = {
      findOne: jest.fn().mockImplementation(({ where }) => {
        const product = mockProducts.get(where.id);
        return Promise.resolve(product ? { ...product } : null);
      }),
      findAndCount: jest.fn().mockImplementation(() => {
        const list = Array.from(mockProducts.values());
        return Promise.resolve([list, list.length]);
      }),
      createQueryBuilder: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockImplementation(() => {
          const list = Array.from(mockProducts.values());
          return Promise.resolve([list, list.length]);
        }),
      }),
    };

    const mockOrderItemRepo = {
      save: jest.fn().mockImplementation((items) => Promise.resolve(items)),
      find: jest.fn().mockResolvedValue([]),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController, ProductsController],
      providers: [
        OrdersService,
        ProductsService,
        { provide: getRepositoryToken(Order), useValue: mockOrderRepo },
        { provide: getRepositoryToken(OrderItem), useValue: mockOrderItemRepo },
        { provide: getRepositoryToken(Product), useValue: mockProductRepo },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = {
            sub: '1',
            role: 'customer',
            email: 'customer@example.com',
          };
          return true;
        },
      })
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // POST /orders Tests
  // ──────────────────────────────────────────────────────────────────────────
  describe('POST /orders', () => {
    it('1. Success path — valid payload returns 201 Created with the correct order total', async () => {
      const payload = {
        customerName: 'Abebe Bikila',
        customerEmail: 'abebe@example.com',
        customerPhone: '+251911223344',
        shippingAddress: 'Bole Sub-city, Addis Ababa',
        items: [
          {
            id: 1,
            name: 'Amoxicillin 500mg',
            price: 80,
            quantity: 2,
            dosage: '1 capsule every 8h',
            prescriptionRequired: true,
          },
        ],
        subtotal: 160,
        tax: 24,
        deliveryFee: 50,
      };

      const res = await request(app.getHttpServer())
        .post('/orders')
        .send(payload)
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('orderNumber');
      expect(res.body.customerName).toBe('Abebe Bikila');
      expect(res.body.subtotal).toBe(160);
      expect(res.body.tax).toBe(24);
      expect(res.body.deliveryFee).toBe(50);
      expect(res.body.total).toBe(234); // 160 + 24 + 50
      expect(res.body.status).toBe('pending');
      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0].name).toBe('Amoxicillin 500mg');
    });

    it('2. Missing required fields — returns 400 Bad Request', async () => {
      // Test A: missing customerName
      const missingName = {
        customerEmail: 'test@example.com',
        customerPhone: '+251911223344',
        shippingAddress: 'Bole, Addis Ababa',
        items: [{ id: 1, name: 'Amoxicillin 500mg', price: 80, quantity: 1 }],
        subtotal: 80,
      };

      await request(app.getHttpServer())
        .post('/orders')
        .send(missingName)
        .expect(400);

      // Test B: missing shippingAddress
      const missingAddress = {
        customerName: 'Abebe',
        customerEmail: 'test@example.com',
        customerPhone: '+251911223344',
        items: [{ id: 1, name: 'Amoxicillin 500mg', price: 80, quantity: 1 }],
        subtotal: 80,
      };

      await request(app.getHttpServer())
        .post('/orders')
        .send(missingAddress)
        .expect(400);

      // Test C: empty items array
      const emptyItems = {
        customerName: 'Abebe',
        customerEmail: 'test@example.com',
        customerPhone: '+251911223344',
        shippingAddress: 'Bole, Addis Ababa',
        items: [],
        subtotal: 0,
      };

      await request(app.getHttpServer())
        .post('/orders')
        .send(emptyItems)
        .expect(400);
    });

    it('3. Invalid or out-of-stock product ID — returns 422 Unprocessable Entity', async () => {
      // Test A: Product ID 9999 does not exist
      const invalidProductPayload = {
        customerName: 'Sara Tesfaye',
        customerEmail: 'sara@example.com',
        customerPhone: '+251911334455',
        shippingAddress: 'Kazanchis, Addis Ababa',
        items: [
          {
            id: 9999,
            name: 'Nonexistent Medicine',
            price: 50,
            quantity: 1,
          },
        ],
        subtotal: 50,
      };

      const resInvalid = await request(app.getHttpServer())
        .post('/orders')
        .send(invalidProductPayload)
        .expect(422);

      expect(resInvalid.body.message).toMatch(/Product with ID 9999 not found/);

      // Test B: Product ID 2 exists but has only 2 in stock; requesting 5
      const outOfStockPayload = {
        customerName: 'Sara Tesfaye',
        customerEmail: 'sara@example.com',
        customerPhone: '+251911334455',
        shippingAddress: 'Kazanchis, Addis Ababa',
        items: [
          {
            id: 2,
            name: 'Paracetamol 500mg',
            price: 45,
            quantity: 5, // Exceeds available stock of 2
          },
        ],
        subtotal: 225,
      };

      const resStock = await request(app.getHttpServer())
        .post('/orders')
        .send(outOfStockPayload)
        .expect(422);

      expect(resStock.body.message).toMatch(/out of stock or has insufficient quantity/);
    });

    it('4. Order total in the response matches what the server calculated, not anything sent in the request body', async () => {
      // Client tampers with the subtotal and total in the payload
      const tamperedPayload = {
        customerName: 'Kebede Michael',
        customerEmail: 'kebede@example.com',
        customerPhone: '+251911556677',
        shippingAddress: 'Piazza, Addis Ababa',
        items: [
          {
            id: 1,
            name: 'Amoxicillin 500mg',
            price: 80,
            quantity: 3, // Real total = 3 * 80 = 240
          },
        ],
        subtotal: 10, // Tampered fake subtotal sent by client
        tax: 36,
        deliveryFee: 50,
      };

      const res = await request(app.getHttpServer())
        .post('/orders')
        .send(tamperedPayload)
        .expect(201);

      // Server-calculated subtotal: 3 * 80 = 240
      expect(res.body.subtotal).toBe(240);
      expect(res.body.subtotal).not.toBe(10);

      // Server-calculated total: 240 + 36 + 50 = 326
      expect(res.body.total).toBe(326);
      expect(res.body.total).not.toBe(10);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // GET /products Tests
  // ──────────────────────────────────────────────────────────────────────────
  describe('GET /products', () => {
    it('returns 200 OK with product list and pagination metadata', async () => {
      const res = await request(app.getHttpServer())
        .get('/products')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('limit');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('filters products by query parameters', async () => {
      const res = await request(app.getHttpServer())
        .get('/products?category=Antibiotics&page=1&limit=10')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});
