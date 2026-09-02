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

    // Roles that belong to the admins table
    const adminRoles = [
      'superadmin',
      'admin',
      'staff',
      'branch_admin',
      'pharmacist',
      'doctor',
      'cashier',
      'worker',
    ];

    // =====================================================
    // ADMIN / STAFF ACCOUNT
    // =====================================================

    if (adminRoles.includes(payload.role)) {
      const admin = await this.adminsService.findOne(Number(payload.sub));

      if (!admin || !admin.isActive) {
        throw new UnauthorizedException(
          'Admin not found or inactive',
        );
      }

      return {
        ...payload,
        role: admin.role as any,
        branchId: payload.branchId ?? null,
      };
    }

    // =====================================================
    // CUSTOMER ACCOUNT
    // =====================================================

    const user = await this.usersService.findById(payload.sub);

    if (!user || !user.isActive) {
      throw new UnauthorizedException(
        'User not found or inactive',
      );
    }

    return {
      ...payload,
      role: (user.role || payload.role) as any,
      branchId: user.branchId ?? payload.branchId ?? null,
    };
  }
}