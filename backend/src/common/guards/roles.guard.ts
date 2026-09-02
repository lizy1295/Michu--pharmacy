import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole, hasRole } from '@michu/shared';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user: JwtPayload }>();
    const user = request.user;

    console.log('========== AUTH DEBUG ==========');
    console.log('request.user:', user);
    console.log('request.user.role:', user?.role);
    console.log('requiredRoles:', requiredRoles);
    console.log('================================');

    if (!user || !user.role) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const allowed = hasRole(user.role as string, requiredRoles);
    if (!allowed) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
