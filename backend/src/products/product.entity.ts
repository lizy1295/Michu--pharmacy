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

  @PrimaryGeneratedColumn({ name: 'product_id' })
  id!: number;

  @Index()
  @Column({
    name: 'product_name',
    type: 'varchar',
    length: 150,
  })
  name!: string;

  @Column({
    name: 'price_etb',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  price!: number;

  @Column({
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  brand?: string | null;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  category?: string | null;

  @Column({
    name: 'requires_prescription',
    type: 'boolean',
    default: false,
  })
  prescriptionRequired!: boolean;

  @Column({
    name: 'stock_quantity',
    type: 'integer',
    default: 0,
  })
  stock!: number;

  @Column({
    type: 'text',
    nullable: true,
  })
  description?: string | null;

  @Column({
    name: 'image_url',
    type: 'text',
    nullable: true,
  })
  imageUrl?: string | null;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  attributes?: object | null;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'active',
  })
  status?: string | null;

  @Column({
    name: 'expiry_date',
    type: 'date',
    nullable: true,
  })
  expiryDate?: Date | null;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt!: Date;
}
