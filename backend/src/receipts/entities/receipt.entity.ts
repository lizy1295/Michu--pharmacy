import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { Payment } from '../../payments/entities/payment.entity';

@Entity('receipts')
export class Receipt {
  @PrimaryGeneratedColumn({ name: 'receipt_id' })
  id!: number;

  @Column({ name: 'receipt_number', type: 'varchar', length: 50, unique: true })
  receiptNumber!: string;

  @Column({ name: 'order_id', type: 'integer', unique: true })
  orderId!: number;

  @OneToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order?: Order;

  @Column({ name: 'payment_id', type: 'integer' })
  paymentId!: number;

  @ManyToOne(() => Payment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'payment_id' })
  payment?: Payment;

  @Column({ name: 'amount', type: 'decimal', precision: 10, scale: 2 })
  amount!: number;

  @Column({ name: 'currency', type: 'varchar', length: 10, default: 'ETB' })
  currency!: string;

  @Column({ name: 'payment_method', type: 'varchar', length: 30 })
  paymentMethod!: string;

  @Column({ name: 'customer_name', type: 'varchar', length: 100 })
  customerName!: string;

  @Column({ name: 'customer_email', type: 'varchar', length: 150 })
  customerEmail!: string;

  @Column({ name: 'customer_phone', type: 'varchar', length: 50, nullable: true })
  customerPhone?: string;

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

  @Column({ name: 'issued_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  issuedAt!: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}


