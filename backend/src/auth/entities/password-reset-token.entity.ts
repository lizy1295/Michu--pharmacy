import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('password_reset_tokens')
export class PasswordResetToken {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ name: 'user_id', type: 'integer' })
  userId!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  /** SHA-256 hex digest of the raw 6-digit OTP — never stored in plaintext. */
  @Index()
  @Column({ name: 'otp_hash', type: 'varchar', length: 64 })
  otpHash!: string;

  /** Number of failed verification attempts (max 3 before lockout) */
  @Column({ name: 'attempts', type: 'integer', default: 0 })
  attempts!: number;

  /** SHA-256 hex digest of single-use reset token issued after OTP verification */
  @Index()
  @Column({ name: 'reset_token_hash', type: 'varchar', length: 64, nullable: true })
  resetTokenHash?: string | null;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt!: Date;

  /** Set when the OTP code is successfully verified */
  @Column({ name: 'verified_at', type: 'timestamp', nullable: true })
  verifiedAt?: Date | null;

  /** Set when the reset token is consumed to change the password */
  @Column({ name: 'used_at', type: 'timestamp', nullable: true })
  usedAt?: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}

