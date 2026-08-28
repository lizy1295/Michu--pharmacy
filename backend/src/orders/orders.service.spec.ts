import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order, OrderStatus } from './entities/order.entity';

describe('OrdersService - Server-side Checkout Validation & Sanitization', () => {
  let service: OrdersService;
  let mockOrderRepository: any;

  beforeEach(async () => {
    mockOrderRepository = {
      count: jest.fn().mockResolvedValue(5),
      create: jest.fn().mockImplementation((orderData) => ({ id: 6, ...orderData })),
      save: jest.fn().mockImplementation((order) => Promise.resolve(order)),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrderRepository,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  describe('Dosage Quantity Validation', () => {
    it('should throw BadRequestException (400) if items array is empty', async () => {
      const payload: any = {
        customerId: 1,
        customerName: 'Abebe Kebede',
        customerEmail: 'abebe@example.com',
        customerPhone: '+251911000001',
        shippingAddress: 'Bole, Addis Ababa',
        items: [],
        subtotal: 100,
      };

      await expect(service.create(payload)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException (400) if quantity is negative', async () => {
      const payload: any = {
        customerId: 1,
        customerName: 'Abebe Kebede',
        customerEmail: 'abebe@example.com',
        customerPhone: '+251911000001',
        shippingAddress: 'Bole, Addis Ababa',
        items: [
          {
            id: 1,
            name: 'Amoxicillin 500mg',
            price: 85,
            quantity: -3, // Negative quantity
          },
        ],
        subtotal: 100,
      };

      await expect(service.create(payload)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException (400) if quantity is a string', async () => {
      const payload: any = {
        customerId: 1,
        customerName: 'Abebe Kebede',
        customerEmail: 'abebe@example.com',
        customerPhone: '+251911000001',
        shippingAddress: 'Bole, Addis Ababa',
        items: [
          {
            id: 1,
            name: 'Amoxicillin 500mg',
            price: 85,
            quantity: 'five' as any, // String quantity
          },
        ],
        subtotal: 100,
      };

      await expect(service.create(payload)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException (400) if quantity is 0', async () => {
      const payload: any = {
        customerId: 1,
        customerName: 'Abebe Kebede',
        customerEmail: 'abebe@example.com',
        customerPhone: '+251911000001',
        shippingAddress: 'Bole, Addis Ababa',
        items: [
          {
            id: 1,
            name: 'Amoxicillin 500mg',
            price: 85,
            quantity: 0, // Zero quantity
          },
        ],
        subtotal: 100,
      };

      await expect(service.create(payload)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException (400) if quantity is a non-integer float', async () => {
      const payload: any = {
        customerId: 1,
        customerName: 'Abebe Kebede',
        customerEmail: 'abebe@example.com',
        customerPhone: '+251911000001',
        shippingAddress: 'Bole, Addis Ababa',
        items: [
          {
            id: 1,
            name: 'Amoxicillin 500mg',
            price: 85,
            quantity: 2.5, // Non-integer
          },
        ],
        subtotal: 100,
      };

      await expect(service.create(payload)).rejects.toThrow(BadRequestException);
    });
  });

  describe('Server-side Text Sanitization (XSS and SQL Injection Prevention)', () => {
    it('should sanitize script tags, inline event handlers, and SQL comments from customer name, notes, and addresses', async () => {
      const payload: any = {
        customerId: 1,
        customerName: 'Abebe <script>alert("xss")</script>Kebede',
        customerEmail: 'abebe@example.com',
        customerPhone: '+251911000001',
        shippingAddress: 'Bole <img src=x onerror=alert(1)> Sub-city -- drop table orders;',
        items: [
          {
            id: 1,
            name: 'Paracetamol <b>500mg</b>',
            price: 50,
            quantity: 2,
            dosage: '1 tab <script>evil()</script>',
          },
        ],
        notes: 'Please call <a href="javascript:steal()">here</a> -- call before 5pm',
        subtotal: 100,
      };

      const result = await service.create(payload);

      expect(result.customerName).toBe('Abebe Kebede');
      expect(result.shippingAddress).toBe('Bole Sub-city drop table orders;');
      expect(result.items[0].name).toBe('Paracetamol 500mg');
      expect(result.items[0].dosage).toBe('1 tab');
      expect(result.notes).toBe('Please call here call before 5pm');
    });

    it('should successfully create an order with valid sanitized inputs', async () => {
      const payload: any = {
        customerId: 1,
        customerName: 'Tigist Alemu',
        customerEmail: 'tigist@example.com',
        customerPhone: '+251922334455',
        shippingAddress: 'Addis Ababa, Ayat Zone 2',
        items: [
          {
            id: 2,
            name: 'Metformin 850mg',
            price: 120,
            quantity: 3,
            dosage: '850mg twice daily',
            prescriptionRequired: true,
          },
        ],
        subtotal: 360,
        tax: 54,
        deliveryFee: 0,
        notes: 'Urgent prescription order',
      };

      const result = await service.create(payload);

      expect(result.orderNumber).toBe('ORD-0006');
      expect(result.customerName).toBe('Tigist Alemu');
      expect(result.total).toBe(414);
      expect(result.items[0].quantity).toBe(3);
      expect(result.status).toBe(OrderStatus.PENDING);
    });
  });
});
