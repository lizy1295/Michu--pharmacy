import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('admins')
export class Admin {
  @PrimaryGeneratedColumn({ name: 'admin_id' })
  id!: number;

  @Column({ name: 'email', type: 'varchar', length: 150, unique: true })
  email!: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash!: string;

  @Column({ name: 'full_name', type: 'varchar', length: 100 })
  name!: string;

  @Column({ name: 'role', type: 'varchar', length: 20, default: 'staff' })
  role!: string;

  @Column({ name: 'phone', type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ name: 'avatar_url', type: 'text', nullable: true })
  avatar?: string;

  @Column({ name: 'last_login_at', type: 'datetime', nullable: true })
  lastLoginAt?: Date;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

