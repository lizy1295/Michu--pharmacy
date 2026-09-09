import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { User } from '../../users/entities/user.entity';

export enum PaymentProviderMethod {
  TELEBIRR = 'telebirr',
  CBE = 'cbe',
}

export enum PaymentRecordStatus {
  PENDING = 'PENDING',
  PAYMENT_INITIATED = 'PAYMENT_INITIATED',
  PAID = 'PAID',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn({ name: 'payment_id' })
  id!: number;

  @Column({ name: 'payment_number', type: 'varchar', length: 50, unique: true })
  paymentNumber!: string;

  @Column({ name: 'order_id', type: 'integer' })
  orderId!: number;

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order?: Order;

  /** The authenticated user who initiated this payment. Nullable for legacy rows. */
  @Column({ name: 'user_id', type: 'integer', nullable: true })
  userId?: number;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({
    name: 'payment_method',
    type: 'varchar',
    length: 20,
    default: PaymentProviderMethod.TELEBIRR,
  })
  paymentMethod!: PaymentProviderMethod;

  @Column({ name: 'amount', type: 'decimal', precision: 10, scale: 2 })
  amount!: number;

  @Column({ name: 'currency', type: 'varchar', length: 10, default: 'ETB' })
  currency!: string;

  @Column({ name: 'provider_transaction_id', type: 'varchar', length: 100, nullable: true })
  providerTransactionId?: string;

  @Column({ name: 'provider_reference', type: 'varchar', length: 100, nullable: true })
  providerReference?: string;

  @Column({
    name: 'payment_status',
    type: 'varchar',
    length: 30,
    default: PaymentRecordStatus.PENDING,
  })
  status!: PaymentRecordStatus;

  @Column({ name: 'checkout_url', type: 'text', nullable: true })
  checkoutUrl?: string;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ name: 'raw_payload', type: 'jsonb', nullable: true })
  rawPayload?: any;

  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  paidAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
