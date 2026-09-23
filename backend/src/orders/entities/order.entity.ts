import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
  AfterLoad,
} from 'typeorm';
import { OrderItem } from './order-item.entity';

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

  @Index('IDX_orders_customer_id')
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

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
  orderItems!: OrderItem[];

  /**
   * Virtual items array populated from orderItems for API backward-compatibility.
   * Not stored in the database.
   */
  items: any[] = [];

  @AfterLoad()
  populateItems() {
    if (this.orderItems && Array.isArray(this.orderItems)) {
      this.items = this.orderItems.map((oi) => ({
        id: oi.productId,
        productId: oi.productId,
        name: oi.product?.name || `Product #${oi.productId}`,
        price: Number(oi.unitPrice),
        quantity: oi.quantity,
        dosage: (oi.product?.attributes as any)?.dosage || undefined,
        prescriptionRequired: Boolean(oi.product?.prescriptionRequired),
        imageType: oi.product?.imageUrl || undefined,
      }));
    }
  }

  @Column({ name: 'subtotal', type: 'decimal', precision: 10, scale: 2 })
  subtotal!: number;

  @Column({ name: 'tax', type: 'decimal', precision: 10, scale: 2, default: 0 })
  tax!: number;

  @Column({ name: 'delivery_fee', type: 'decimal', precision: 10, scale: 2, default: 0 })
  deliveryFee!: number;

  @Column({ name: 'total', type: 'decimal', precision: 10, scale: 2 })
  total!: number;

  @Index('IDX_orders_status')
  @Column({ name: 'status', type: 'varchar', length: 20, default: OrderStatus.PENDING })
  status!: OrderStatus;

  @Index('IDX_orders_payment_status')
  @Column({ name: 'payment_status', type: 'varchar', length: 20, default: PaymentStatus.PENDING })
  paymentStatus!: PaymentStatus;

  @Column({ name: 'payment_method', type: 'varchar', length: 50, nullable: true })
  paymentMethod?: string;

  @Column({ name: 'proof_image', type: 'text', nullable: true })
  proofImage?: string | null;

  @Column({ name: 'transaction_id', type: 'varchar', length: 100, nullable: true })
  transactionId?: string | null;

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


