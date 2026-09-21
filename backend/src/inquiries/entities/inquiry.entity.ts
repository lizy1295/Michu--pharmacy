import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum InquiryStatus {
  OPEN = 'open',
  ANSWERED = 'answered',
}

@Entity('inquiries')
export class Inquiry {
  @PrimaryGeneratedColumn({ name: 'inquiry_id' })
  id!: number;

  @Column({ name: 'customer_name', type: 'varchar', length: 100 })
  customerName!: string;

  @Column({ name: 'customer_email', type: 'varchar', length: 150 })
  customerEmail!: string;

  @Column({ name: 'customer_phone', type: 'varchar', length: 30, nullable: true })
  customerPhone?: string;

  @Column({ name: 'message', type: 'text' })
  message!: string;

  @Column({ name: 'status', type: 'varchar', length: 20, default: InquiryStatus.OPEN })
  status!: InquiryStatus;

  @Column({ name: 'staff_reply', type: 'text', nullable: true })
  staffReply?: string;

  @Column({ name: 'replied_by', type: 'varchar', length: 100, nullable: true })
  repliedBy?: string;

  @Column({ name: 'replied_at', type: 'timestamp', nullable: true })
  repliedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

