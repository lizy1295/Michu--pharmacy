import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { UsersService } from '../../users/users.service';
import { AdminsService } from '../../admins/admins.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly adminsService: AdminsService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    // Try to validate as a regular user first
    try {
      const user = await this.usersService.findById(payload.sub);
      if (user && user.isActive) {
        return {
          ...payload,
          role: (user.role || payload.role) as any,
          branchId: user.branchId ?? payload.branchId ?? null,
        };
      }
    } catch {
      // User not found, try admin
    }

    // Try to validate as an admin
    try {
      const admin = await this.adminsService.findOne(Number(payload.sub));
      if (admin && admin.isActive) {
        return {
          ...payload,
          role: (admin.role || payload.role) as any,
          branchId: payload.branchId ?? null,
        };
      }
    } catch {
      // Admin not found either
    }

    // Fallback lookup by email if sub ID space differed
    if (payload.email) {
      try {
        const userByEmail = await this.usersService.findByEmail(payload.email);
        if (userByEmail && userByEmail.isActive) {
          return {
            sub: String(userByEmail.id),
            email: userByEmail.email,
            role: (userByEmail.role || payload.role) as any,
            branchId: userByEmail.branchId ?? null,
            type: 'access',
          };
        }
      } catch {}
    }

    throw new UnauthorizedException('User not found or inactive');
  }
}