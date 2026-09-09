import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, IsNull } from 'typeorm';
import { createHash, randomBytes, randomInt } from 'crypto';
import * as bcrypt from 'bcrypt';
import { AuthResponse, AuthUser } from '@michu/shared';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { MailService } from '../mail/mail.service';
import { NotificationService } from '../mail/notification.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
  private readonly RESET_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes after OTP verified
  private readonly MAX_OTP_ATTEMPTS = 3;
  private readonly BCRYPT_ROUNDS = 12;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly notificationService: NotificationService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(PasswordResetToken)
    private readonly passwordResetTokenRepository: Repository<PasswordResetToken>,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const user = await this.usersService.createCustomer(dto);
    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    let user: User | null = null;

    if (dto.email) {
      user = await this.usersService.findByEmail(dto.email, true);
      if (!user) {
        user = await this.usersService.findByPhone(dto.email, true);
      }
    }

    // Fall back to phone lookup if no user found yet and dto.phone is provided
    if (!user && dto.phone) {
      user = await this.usersService.findByPhone(dto.phone, true);
    }

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await this.usersService.validatePassword(user, dto.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    return this.buildAuthResponse(user);
  }


  async refresh(refreshToken: string): Promise<AuthResponse> {
    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    const tokenHash = this.hashToken(refreshToken);
    const storedToken = await this.refreshTokenRepository.findOne({
      where: {
        tokenHash,
        userId: Number(payload.sub),
        isRevoked: false,
        expiresAt: MoreThan(new Date()),
      },
      relations: ['user'],
    });

    if (!storedToken) {
      throw new UnauthorizedException('Refresh token revoked or expired');
    }

    await this.refreshTokenRepository.update(storedToken.id, { isRevoked: true });

    const user = storedToken.user;
    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    return this.buildAuthResponse(user);
  }

  async logout(refreshToken: string): Promise<void> {
    const tokenHash = this.hashToken(refreshToken);
    await this.refreshTokenRepository.update({ tokenHash }, { isRevoked: true });
  }

  private async buildAuthResponse(user: User): Promise<AuthResponse> {
    const payload = this.toJwtPayload(user);
    const accessToken = await this.signAccessToken(payload);
    const refreshToken = await this.signRefreshToken(payload);
    await this.storeRefreshToken(user.id, refreshToken);

    return {
      user: this.toAuthUser(user),
      tokens: { accessToken, refreshToken },
    };
  }

  private toJwtPayload(user: User): Omit<JwtPayload, 'type'> {
    return {
      sub: String(user.id),
      email: user.email,
      role: user.role as any,
      branchId: user.branchId ?? null,
    };
  }

  private toAuthUser(user: User): AuthUser {
    return {
      id: String(user.id),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role as any,
      branchId: user.branchId ?? null,
    };
  }

  private signAccessToken(payload: Omit<JwtPayload, 'type'>): Promise<string> {
    return this.jwtService.signAsync(
      { ...payload, type: 'access' as const },
      {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN', '15m') as `${number}${'s' | 'm' | 'h' | 'd'}`,
      },
    );
  }

  private signRefreshToken(payload: Omit<JwtPayload, 'type'>): Promise<string> {
    return this.jwtService.signAsync(
      { ...payload, type: 'refresh' as const },
      {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d') as `${number}${'s' | 'm' | 'h' | 'd'}`,
      },
    );
  }

  private async storeRefreshToken(userId: number, token: string): Promise<void> {
    const tokenHash = this.hashToken(token);
    const expiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');
    const expiresAt = this.parseExpiry(expiresIn);

    const refreshToken = this.refreshTokenRepository.create({
      userId,
      tokenHash,
      expiresAt,
    });

    await this.refreshTokenRepository.save(refreshToken);
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private parseExpiry(expiry: string): Date {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return new Date(Date.now() + value * multipliers[unit]);
  }

  // ─── Password Reset (Secure OTP Flow) ──────────────────────────────────────

  /**
   * Initiate OTP-based password-recovery flow.
   * Generates a 6-digit numeric OTP, stores SHA-256 hash with 10-minute TTL,
   * dispatches via email/SMS, and returns an anti-enumeration safe response.
   */
  async forgotPassword(email: string, phone?: string): Promise<{ message: string }> {
    const safeResponse = {
      message: 'If that account is registered, a 6-digit verification code has been sent.',
    };

    const cleanEmail = email ? email.trim().toLowerCase() : '';
    let user = cleanEmail ? await this.usersService.findByEmail(cleanEmail) : null;

    if (!user && phone) {
      user = await this.usersService.findByPhone(phone.trim());
    }

    if (!user) {
      // Return same response — do NOT reveal whether the user exists (anti-enumeration)
      return safeResponse;
    }

    // Invalidate all previous unused OTP tokens for this user
    await this.passwordResetTokenRepository
      .createQueryBuilder()
      .update(PasswordResetToken)
      .set({ usedAt: new Date() })
      .where('user_id = :userId AND used_at IS NULL', { userId: user.id })
      .execute();

    // Generate cryptographically secure 6-digit numeric OTP (100000 - 999999)
    const rawOtp = randomInt(100000, 1000000).toString();
    const otpHash = this.hashToken(rawOtp);
    const expiresAt = new Date(Date.now() + this.OTP_TTL_MS);

    const tokenRecord = this.passwordResetTokenRepository.create({
      userId: user.id,
      otpHash,
      attempts: 0,
      expiresAt,
    });
    await this.passwordResetTokenRepository.save(tokenRecord);

    // Dispatch OTP via notification service (email + SMS ready)
    void this.notificationService.sendOtp(
      {
        email: user.email,
        phone: user.phone ?? phone,
      },
      rawOtp,
    );

    return safeResponse;
  }

  /**
   * Verify the 6-digit OTP code.
   * Enforces 10-minute expiry and max 3 attempts rate-limiting.
   * If valid, generates a short-lived single-use resetToken.
   */
  async verifyOtp(email: string, otp: string): Promise<{ resetToken: string; message: string }> {
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const user = await this.usersService.findByEmail(cleanEmail);

    if (!user) {
      throw new BadRequestException('Invalid or expired verification code.');
    }

    // Find the latest pending OTP record for this user
    const record = await this.passwordResetTokenRepository.findOne({
      where: {
        userId: user.id,
        verifiedAt: IsNull(),
        usedAt: IsNull(),
      },
      order: { createdAt: 'DESC' },
    });

    if (!record) {
      throw new BadRequestException('Invalid or expired verification code.');
    }

    // Check expiry
    if (new Date() > record.expiresAt) {
      await this.passwordResetTokenRepository.update(record.id, { usedAt: new Date() });
      throw new BadRequestException('Verification code has expired. Please request a new code.');
    }

    // Check rate-limit (max 3 failed attempts)
    if (record.attempts >= this.MAX_OTP_ATTEMPTS) {
      await this.passwordResetTokenRepository.update(record.id, { usedAt: new Date() });
      throw new BadRequestException('Too many failed attempts. This code has been invalidated. Please request a new one.');
    }

    const cleanOtp = otp ? otp.trim() : '';
    const providedHash = this.hashToken(cleanOtp);

    if (providedHash !== record.otpHash) {
      const updatedAttempts = record.attempts + 1;
      await this.passwordResetTokenRepository.update(record.id, { attempts: updatedAttempts });
      const remaining = this.MAX_OTP_ATTEMPTS - updatedAttempts;

      if (remaining <= 0) {
        await this.passwordResetTokenRepository.update(record.id, { usedAt: new Date() });
        throw new BadRequestException('Too many failed attempts. This code has been invalidated. Please request a new one.');
      }

      throw new BadRequestException(`Invalid verification code. ${remaining} attempt(s) remaining.`);
    }

    // OTP verified successfully -> issue single-use resetToken
    const resetToken = randomBytes(32).toString('hex');
    const resetTokenHash = this.hashToken(resetToken);
    const resetExpiresAt = new Date(Date.now() + this.RESET_TOKEN_TTL_MS);

    await this.passwordResetTokenRepository.update(record.id, {
      verifiedAt: new Date(),
      resetTokenHash,
      expiresAt: resetExpiresAt,
    });

    return {
      resetToken,
      message: 'Code verified successfully. Please set your new password.',
    };
  }

  /**
   * Consume a single-use reset token and update the user's password.
   */
  async resetPassword(resetToken: string, newPassword: string): Promise<{ message: string }> {
    if (!resetToken) {
      throw new BadRequestException('Reset token is required.');
    }

    if (!newPassword || newPassword.length < 8) {
      throw new BadRequestException('New password must be at least 8 characters long.');
    }

    const tokenHash = this.hashToken(resetToken);

    const record = await this.passwordResetTokenRepository.findOne({
      where: {
        resetTokenHash: tokenHash,
        usedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
      relations: ['user'],
    });

    if (!record || !record.verifiedAt) {
      throw new BadRequestException('Invalid or expired reset session. Please request a new code.');
    }

    // Hash the new password (same salt rounds as UsersService)
    const passwordHash = await bcrypt.hash(newPassword, this.BCRYPT_ROUNDS);

    // Update user's password directly via the repository
    await this.passwordResetTokenRepository.manager
      .getRepository(User)
      .update(record.userId, { passwordHash });

    // Mark token as consumed — prevents replay
    await this.passwordResetTokenRepository.update(record.id, { usedAt: new Date() });

    this.logger.log(`Password reset completed successfully for user #${record.userId}`);

    return { message: 'Password updated successfully. You can now log in.' };
  }
}

