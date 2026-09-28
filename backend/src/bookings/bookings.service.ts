import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { Doctor } from '../doctors/doctor.entity';
import { CreateBookingDto, UpdateBookingStatusDto } from './dto/bookings.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { isStaffRole } from '@michu/shared';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,

    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,
  ) {}

  /**
   * Create a booking for the authenticated customer.
   * Customer identity is taken exclusively from the JWT — never from the request body.
   */
  async create(dto: CreateBookingDto, user: JwtPayload): Promise<Booking> {
    // Validate requested date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const requestedDate = new Date(dto.requestedDate);
    if (requestedDate < today) {
      throw new BadRequestException('requestedDate must be today or a future date.');
    }

    // Validate doctorId if provided
    if (dto.doctorId) {
      const doctor = await this.doctorRepo.findOne({ where: { id: dto.doctorId } });
      if (!doctor) {
        throw new NotFoundException(`Doctor with ID ${dto.doctorId} not found.`);
      }
    }

    const booking = this.bookingRepo.create({
      customerId: Number(user.sub),
      customerName: dto.customerName ?? `Customer #${user.sub}`,
      customerEmail: user.email ?? '',
      customerPhone: dto.customerPhone,
      doctorId: dto.doctorId ?? null,
      doctorName: dto.doctorName,
      requestedDate: dto.requestedDate,
      requestedTime: dto.requestedTime,
      reason: dto.reason,
      status: BookingStatus.PENDING,
    });

    return this.bookingRepo.save(booking);
  }

  /**
   * List all bookings — staff only.
   * Supports filtering by status and pagination.
   */
  async findAll(
    status?: BookingStatus,
    search?: string,
    page = 1,
    limit = 20,
  ): Promise<{ data: Booking[]; total: number; page: number; limit: number }> {
    const qb = this.bookingRepo
      .createQueryBuilder('b')
      .orderBy('b.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (status) {
      qb.andWhere('b.status = :status', { status });
    }
    if (search) {
      qb.andWhere(
        '(b.customer_name ILIKE :q OR b.customer_email ILIKE :q OR b.doctor_name ILIKE :q)',
        { q: `%${search}%` },
      );
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  /**
   * List bookings belonging to the authenticated customer.
   */
  async findByCustomer(userId: number): Promise<Booking[]> {
    return this.bookingRepo.find({
      where: { customerId: userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get a single booking.
   * Staff can access any booking; customers can only access their own.
   */
  async findOne(id: number, user: JwtPayload): Promise<Booking> {
    const booking = await this.bookingRepo.findOne({ where: { id } });
    if (!booking) {
      throw new NotFoundException(`Booking #${id} not found.`);
    }

    if (!isStaffRole(user.role)) {
      if (booking.customerId !== Number(user.sub)) {
        throw new ForbiddenException('You are not authorized to view this booking.');
      }
    }

    return booking;
  }

  /**
   * Update booking status — staff only.
   * Sets confirmedAt / cancelledAt timestamps automatically.
   */
  async updateStatus(id: number, dto: UpdateBookingStatusDto): Promise<Booking> {
    const booking = await this.bookingRepo.findOne({ where: { id } });
    if (!booking) {
      throw new NotFoundException(`Booking #${id} not found.`);
    }

    booking.status = dto.status;

    if (dto.adminNotes !== undefined) {
      booking.adminNotes = dto.adminNotes;
    }

    const now = new Date();
    if (dto.status === BookingStatus.CONFIRMED) {
      booking.confirmedAt = now;
    } else if (dto.status === BookingStatus.CANCELLED) {
      booking.cancelledAt = now;
    }

    return this.bookingRepo.save(booking);
  }
}
