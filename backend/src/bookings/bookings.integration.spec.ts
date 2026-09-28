import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, ExecutionContext } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
const request = require('supertest');
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { Booking, BookingStatus } from './entities/booking.entity';
import { Doctor } from '../doctors/doctor.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

// ─── Test doubles ──────────────────────────────────────────────────────────

function makeBooking(overrides: Partial<Booking> = {}): Booking {
  const b = new Booking();
  b.id = 1;
  b.customerId = 42;
  b.customerName = 'Abebe Bikila';
  b.customerEmail = 'abebe@example.com';
  b.customerPhone = '+251911223344';
  b.doctorId = null;
  b.doctorName = 'Dr. Million Negasa (Founder & Chief Pharmacist)';
  b.requestedDate = '2099-12-01'; // Far-future date
  b.requestedTime = '10:00 AM';
  b.reason = 'Need guidance on drug interactions for my hypertension medication.';
  b.status = BookingStatus.PENDING;
  b.adminNotes = undefined;
  b.confirmedAt = null;
  b.cancelledAt = null;
  b.createdAt = new Date();
  b.updatedAt = new Date();
  return Object.assign(b, overrides);
}

describe('Bookings Integration Tests (POST /bookings, PATCH /bookings/:id/status, GET)', () => {
  let app: INestApplication;

  // In-memory stores
  let mockBookingsMap: Map<number, Booking>;
  let bookingIdCounter: number;

  // JWT user contexts — swapped per test using canActivateFn
  let activeUser = {
    sub: '42',
    email: 'abebe@example.com',
    role: 'customer' as string,
  };

  beforeAll(async () => {
    mockBookingsMap = new Map();
    bookingIdCounter = 1;

    // ── Mock Doctor repo (no doctors seeded; doctorId is never sent in tests) ──
    const mockDoctorRepo = {
      findOne: jest.fn().mockResolvedValue(null),
    };

    // ── Mock Booking repo ──────────────────────────────────────────────────
    const mockBookingRepo = {
      create: jest.fn().mockImplementation((dto) => {
        const b = new Booking();
        Object.assign(b, dto);
        b.id = bookingIdCounter++;
        b.createdAt = new Date();
        b.updatedAt = new Date();
        return b;
      }),
      save: jest.fn().mockImplementation((booking: Booking) => {
        mockBookingsMap.set(booking.id, booking);
        return Promise.resolve(booking);
      }),
      findOne: jest.fn().mockImplementation(({ where }) => {
        return Promise.resolve(mockBookingsMap.get(where.id) ?? null);
      }),
      find: jest.fn().mockImplementation(({ where }) => {
        const results = Array.from(mockBookingsMap.values()).filter(
          (b) => b.customerId === where.customerId,
        );
        return Promise.resolve(results);
      }),
      createQueryBuilder: jest.fn().mockReturnValue({
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockImplementation(() => {
          const list = Array.from(mockBookingsMap.values());
          return Promise.resolve([list, list.length]);
        }),
      }),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [BookingsController],
      providers: [
        BookingsService,
        { provide: getRepositoryToken(Booking), useValue: mockBookingRepo },
        { provide: getRepositoryToken(Doctor), useValue: mockDoctorRepo },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = { ...activeUser };
          return true;
        },
      })
      .overrideGuard(RolesGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          const user = req.user ?? activeUser;
          const staffRoles = ['superadmin', 'admin', 'staff', 'branch_admin', 'pharmacist', 'doctor', 'cashier', 'worker'];
          if (!staffRoles.includes(user.role)) {
            const { ForbiddenException } = require('@nestjs/common');
            throw new ForbiddenException('Insufficient permissions');
          }
          return true;
        },
      })
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false, // allow customerName passthrough
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  // Helper to reset user context per test
  function asCustomer(id = '42', email = 'abebe@example.com') {
    activeUser = { sub: id, email, role: 'customer' };
  }
  function asStaff() {
    activeUser = { sub: '1', email: 'admin@mph.et', role: 'admin' };
  }

  // Valid payload factory
  function validPayload(overrides: Record<string, any> = {}) {
    return {
      doctorName: 'Dr. Million Negasa (Founder & Chief Pharmacist)',
      requestedDate: '2099-12-01',
      requestedTime: '10:00 AM',
      reason: 'Need guidance on drug interactions for my hypertension medication.',
      customerName: 'Abebe Bikila',
      ...overrides,
    };
  }

  // ── POST /bookings ─────────────────────────────────────────────────────────

  describe('POST /bookings', () => {
    it('1. Valid payload → 201, response contains id, status pending, doctor name', async () => {
      asCustomer();
      const res = await request(app.getHttpServer())
        .post('/bookings')
        .send(validPayload())
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.status).toBe(BookingStatus.PENDING);
      expect(res.body.doctorName).toBe('Dr. Million Negasa (Founder & Chief Pharmacist)');
      expect(res.body.requestedDate).toBe('2099-12-01');
      expect(res.body.requestedTime).toBe('10:00 AM');
    });

    it('2. customerId / customerEmail in body are IGNORED — values come from JWT', async () => {
      asCustomer('42', 'abebe@example.com');
      const tamperedPayload = validPayload({
        // These should be silently ignored (whitelist strips them or service overrides)
        customerEmail: 'hacker@evil.com',
      });

      const res = await request(app.getHttpServer())
        .post('/bookings')
        .send(tamperedPayload)
        .expect(201);

      // customerEmail must match what came from the JWT, not the body
      expect(res.body.customerEmail).toBe('abebe@example.com');
      expect(res.body.customerEmail).not.toBe('hacker@evil.com');
    });

    it('3. Missing requestedDate → 400 Bad Request', async () => {
      asCustomer();
      const { requestedDate: _removed, ...payload } = validPayload();
      await request(app.getHttpServer())
        .post('/bookings')
        .send(payload)
        .expect(400);
    });

    it('4. Missing reason → 400 Bad Request', async () => {
      asCustomer();
      const { reason: _removed, ...payload } = validPayload();
      await request(app.getHttpServer())
        .post('/bookings')
        .send(payload)
        .expect(400);
    });

    it('5. reason too short (< 5 chars) → 400 Bad Request', async () => {
      asCustomer();
      await request(app.getHttpServer())
        .post('/bookings')
        .send(validPayload({ reason: 'Hi' }))
        .expect(400);
    });

    it('6. requestedDate in the past → 400 Bad Request', async () => {
      asCustomer();
      await request(app.getHttpServer())
        .post('/bookings')
        .send(validPayload({ requestedDate: '2000-01-01' }))
        .expect(400);
    });
  });

  // ── GET /bookings/my ───────────────────────────────────────────────────────

  describe('GET /bookings/my', () => {
    it('7. Authenticated customer → 200, returns array of their bookings', async () => {
      asCustomer('42', 'abebe@example.com');
      const res = await request(app.getHttpServer())
        .get('/bookings/my')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  // ── GET /bookings (admin only) ─────────────────────────────────────────────

  describe('GET /bookings', () => {
    it('8. Customer role → 403 Forbidden (staff route)', async () => {
      asCustomer();
      await request(app.getHttpServer())
        .get('/bookings')
        .expect(403);
    });

    it('9. Admin role → 200, paginated response with data/total/page/limit', async () => {
      asStaff();
      const res = await request(app.getHttpServer())
        .get('/bookings')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('limit');
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // ── GET /bookings/:id — ownership enforcement ──────────────────────────────

  describe('GET /bookings/:id', () => {
    let createdBookingId: number;

    beforeAll(async () => {
      // Create a booking as Customer A (id=42)
      asCustomer('42', 'abebe@example.com');
      const res = await request(app.getHttpServer())
        .post('/bookings')
        .send(validPayload())
        .expect(201);
      createdBookingId = res.body.id;
    });

    it('10. Customer A can view their own booking → 200', async () => {
      asCustomer('42', 'abebe@example.com');
      await request(app.getHttpServer())
        .get(`/bookings/${createdBookingId}`)
        .expect(200);
    });

    it('11. Customer B requesting Customer A booking → 403 Forbidden', async () => {
      asCustomer('999', 'other@example.com'); // different customer
      await request(app.getHttpServer())
        .get(`/bookings/${createdBookingId}`)
        .expect(403);
    });
  });

  // ── PATCH /bookings/:id/status ─────────────────────────────────────────────

  describe('PATCH /bookings/:id/status', () => {
    let bookingId: number;

    beforeAll(async () => {
      asCustomer('42', 'abebe@example.com');
      const res = await request(app.getHttpServer())
        .post('/bookings')
        .send(validPayload())
        .expect(201);
      bookingId = res.body.id;
    });

    it('12. Admin confirms booking → 200, status=confirmed, confirmedAt set', async () => {
      asStaff();
      const res = await request(app.getHttpServer())
        .patch(`/bookings/${bookingId}/status`)
        .send({ status: 'confirmed', adminNotes: 'Dr. Million will call at 10 AM.' })
        .expect(200);

      expect(res.body.status).toBe(BookingStatus.CONFIRMED);
      expect(res.body.confirmedAt).not.toBeNull();
      expect(res.body.adminNotes).toBe('Dr. Million will call at 10 AM.');
    });

    it('13. Admin cancels a different booking → 200, status=cancelled, cancelledAt set', async () => {
      // Create a fresh pending booking
      asCustomer('42', 'abebe@example.com');
      const created = await request(app.getHttpServer())
        .post('/bookings')
        .send(validPayload())
        .expect(201);

      asStaff();
      const res = await request(app.getHttpServer())
        .patch(`/bookings/${created.body.id}/status`)
        .send({ status: 'cancelled' })
        .expect(200);

      expect(res.body.status).toBe(BookingStatus.CANCELLED);
      expect(res.body.cancelledAt).not.toBeNull();
    });

    it('14. Invalid status value → 400 Bad Request', async () => {
      asStaff();
      await request(app.getHttpServer())
        .patch(`/bookings/${bookingId}/status`)
        .send({ status: 'flying' }) // not a valid status
        .expect(400);
    });

    it('15. Customer cannot update status → 403 Forbidden', async () => {
      asCustomer();
      await request(app.getHttpServer())
        .patch(`/bookings/${bookingId}/status`)
        .send({ status: 'confirmed' })
        .expect(403);
    });
  });
});
