import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { createHash } from 'crypto';
import { AuthResponse, AuthUser } from '@michu/shared';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
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
}
