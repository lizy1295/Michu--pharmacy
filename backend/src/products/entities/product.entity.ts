import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  brand?: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  category?: string | null;

  @Column({ type: 'boolean', default: false })
  prescriptionRequired!: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  imageType?: string | null;

  @Column({ type: 'simple-array', nullable: true })
  branches?: string[] | null;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'integer', default: 0 })
  stock!: number;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
