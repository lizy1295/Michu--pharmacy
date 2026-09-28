import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Doctor } from '../../doctors/doctor.entity';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn({ name: 'booking_id' })
  id!: number;

  /** Customer who made the booking — populated from JWT, never from request body. */
  @Index('IDX_bookings_customer_id')
  @Column({ name: 'customer_id', type: 'integer' })
  customerId!: number;

  @Column({ name: 'customer_name', type: 'varchar', length: 120 })
  customerName!: string;

  @Column({ name: 'customer_email', type: 'varchar', length: 150 })
  customerEmail!: string;

  @Column({ name: 'customer_phone', type: 'varchar', length: 30, nullable: true })
  customerPhone?: string;

  /** Optional FK to the doctors table. Nullable so doctor deletion doesn't break historical bookings. */
  @Index('IDX_bookings_doctor_id')
  @Column({ name: 'doctor_id', type: 'integer', nullable: true })
  doctorId?: number | null;

  @ManyToOne(() => Doctor, { nullable: true, onDelete: 'SET NULL', eager: false })
  @JoinColumn({ name: 'doctor_id' })
  doctor?: Doctor | null;

  /** Denormalised doctor name stored on creation — survives doctor record changes. */
  @Column({ name: 'doctor_name', type: 'varchar', length: 120 })
  doctorName!: string;

  /** ISO date string, e.g. "2026-09-30" */
  @Column({ name: 'requested_date', type: 'varchar', length: 20 })
  requestedDate!: string;

  /** Time slot string, e.g. "10:00 AM" */
  @Column({ name: 'requested_time', type: 'varchar', length: 20 })
  requestedTime!: string;

  /** Patient's stated reason for the consultation. */
  @Column({ name: 'reason', type: 'text' })
  reason!: string;

  @Index('IDX_bookings_status')
  @Column({ name: 'status', type: 'varchar', length: 20, default: BookingStatus.PENDING })
  status!: BookingStatus;

  /** Staff-only internal notes (e.g. reason for cancellation). */
  @Column({ name: 'admin_notes', type: 'text', nullable: true })
  adminNotes?: string;

  @Column({ name: 'confirmed_at', type: 'timestamp', nullable: true })
  confirmedAt?: Date | null;

  @Column({ name: 'cancelled_at', type: 'timestamp', nullable: true })
  cancelledAt?: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
