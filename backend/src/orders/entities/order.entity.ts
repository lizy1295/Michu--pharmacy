import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum OrderStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  SHIPPED = 'shipped',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAYMENT_INITIATED = 'payment_initiated',
  PAID = 'paid',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn({ name: 'order_id' })
  id!: number;

  @Column({ name: 'order_number', type: 'varchar', length: 50, unique: true })
  orderNumber!: string;

  @Column({ name: 'customer_id', type: 'integer' })
  customerId!: number;

  @Column({ name: 'customer_name', type: 'varchar', length: 100 })
  customerName!: string;

  @Column({ name: 'customer_email', type: 'varchar', length: 150 })
  customerEmail!: string;

  @Column({ name: 'customer_phone', type: 'varchar', length: 20 })
  customerPhone!: string;

  @Column({ name: 'shipping_address', type: 'text' })
  shippingAddress!: string;

  @Column({ name: 'items', type: 'jsonb' })
  items!: any[];

  @Column({ name: 'subtotal', type: 'decimal', precision: 10, scale: 2 })
  subtotal!: number;

  @Column({ name: 'tax', type: 'decimal', precision: 10, scale: 2, default: 0 })
  tax!: number;

  @Column({ name: 'delivery_fee', type: 'decimal', precision: 10, scale: 2, default: 0 })
  deliveryFee!: number;

  @Column({ name: 'total', type: 'decimal', precision: 10, scale: 2 })
  total!: number;

  @Column({ name: 'status', type: 'varchar', length: 20, default: OrderStatus.PENDING })
  status!: OrderStatus;

  @Column({ name: 'payment_status', type: 'varchar', length: 20, default: PaymentStatus.PENDING })
  paymentStatus!: PaymentStatus;

  @Column({ name: 'payment_method', type: 'varchar', length: 50, nullable: true })
  paymentMethod?: string;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt?: Date;

  @Column({ name: 'shipped_at', type: 'timestamp', nullable: true })
  shippedAt?: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
