import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({
    name: 'user_id',
    type: 'integer',
  })
  id!: number;

  @Index()
  @Column({
    name: 'first_name',
    type: 'varchar',
    length: 100,
  })
  firstName!: string;

  @Index()
  @Column({
    name: 'last_name',
    type: 'varchar',
    length: 100,
  })
  lastName!: string;

  @Index({ unique: true })
  @Column({
    name: 'username',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  username?: string | null;

  @Index({ unique: true })
  @Column({
    name: 'email',
    type: 'varchar',
    length: 255,
  })
  email!: string;

  @Column({
    name: 'password_hash',
    type: 'varchar',
    length: 255,
    select: false,
  })
  passwordHash!: string;

  @Column({
    name: 'phone',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  phone?: string | null;

  @Column({
    name: 'gender',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  gender?: string | null;

  @Column({
    name: 'date_of_birth',
    type: 'date',
    nullable: true,
  })
  dateOfBirth?: Date | null;

  @Column({
    name: 'profile_image',
    type: 'text',
    nullable: true,
  })
  profileImage?: string | null;

  @Column({
    name: 'role_id',
    type: 'integer',
    default: 1,
  })
  roleId!: number;

  @Column({
    name: 'role',
    type: 'varchar',
    length: 50,
    default: 'customer',
  })
  role!: string;

  @Column({
    name: 'branch_id',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  branchId?: string | null;

  @Column({
    name: 'email_verified',
    type: 'boolean',
    default: false,
  })
  emailVerified!: boolean;

  @Column({
    name: 'phone_verified',
    type: 'boolean',
    default: false,
  })
  phoneVerified!: boolean;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive!: boolean;

  @Column({
    name: 'last_login',
    type: 'timestamp',
    nullable: true,
  })
  lastLogin?: Date | null;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt!: Date;
}
