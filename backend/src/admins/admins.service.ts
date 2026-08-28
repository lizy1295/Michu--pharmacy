import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { isStaffRole } from '@michu/shared';
import { Admin } from './entities/admin.entity';
import { CreateAdminDto, AdminLoginDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AdminAuthResponse } from './interfaces/admin.interface';
import { UsersService } from '../users/users.service';

@Injectable()
export class AdminsService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminsRepo: Repository<Admin>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  async validateCredentials(email: string, password: string): Promise<Admin | null> {
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Check in admins table
    const admin = await this.adminsRepo.findOne({ where: { email: normalizedEmail } });
    if (admin && admin.isActive) {
      let isPasswordValid = false;
      if (admin.passwordHash.startsWith('$2a$') || admin.passwordHash.startsWith('$2b$')) {
        isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
      } else {
        isPasswordValid = admin.passwordHash === password;
        if (isPasswordValid) {
          // Upgrade plaintext password hash to bcrypt hash
          admin.passwordHash = await bcrypt.hash(password, 10);
          await this.adminsRepo.save(admin);
        }
      }

      if (isPasswordValid) {
        await this.adminsRepo.update(admin.id, { lastLoginAt: new Date() });
        return admin;
      }
    }

    // 2. Check in users table for staff / admin users
    try {
      const user = await this.usersService.findByEmail(normalizedEmail, true);
      if (user && user.isActive && isStaffRole(user.role)) {
        const isPasswordValid = await this.usersService.validatePassword(user, password);
        if (isPasswordValid) {
          // Map user to Admin model representation
          const mappedAdmin = new Admin();
          mappedAdmin.id = user.id;
          mappedAdmin.email = user.email;
          mappedAdmin.name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Admin';
          mappedAdmin.role = user.role;
          mappedAdmin.phone = user.phone ?? undefined;
          mappedAdmin.avatar = user.profileImage ?? undefined;
          mappedAdmin.isActive = user.isActive;
          mappedAdmin.lastLoginAt = new Date();
          mappedAdmin.createdAt = user.createdAt;
          mappedAdmin.updatedAt = user.updatedAt;
          return mappedAdmin;
        }
      }
    } catch {
      // User lookup failed
    }

    return null;
  }

  async login(dto: AdminLoginDto): Promise<AdminAuthResponse> {
    const admin = await this.validateCredentials(dto.email, dto.password);
    if (!admin) {
      throw new BadRequestException('Invalid email or password');
    }

    const secret = this.configService.getOrThrow<string>('JWT_ACCESS_SECRET');
    const expiresIn = this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m');

    const accessToken = await this.jwtService.signAsync(
      { sub: String(admin.id), email: admin.email, role: admin.role, type: 'access' },
      { secret, expiresIn: expiresIn as any },
    );

    const refreshSecret = this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');
    const refreshToken = await this.jwtService.signAsync(
      { sub: String(admin.id), email: admin.email, role: admin.role, type: 'refresh' },
      { secret: refreshSecret, expiresIn: '7d' as any },
    );

    return {
      accessToken,
      refreshToken,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role as any,
        avatar: admin.avatar,
        phone: admin.phone,
        lastLogin: admin.lastLoginAt?.toISOString(),
        createdAt: admin.createdAt ? admin.createdAt.toISOString() : new Date().toISOString(),
      },
    };
  }


  async findAll(): Promise<Admin[]> {
    return this.adminsRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: number): Promise<Admin> {
    const admin = await this.adminsRepo.findOne({ where: { id } });
    if (!admin) throw new NotFoundException(`Admin with id ${id} not found`);
    return admin;
  }

  async create(dto: CreateAdminDto): Promise<Admin> {
    const existing = await this.adminsRepo.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new BadRequestException('Email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const admin = this.adminsRepo.create({
      email: dto.email,
      passwordHash,
      name: dto.name,
      role: dto.role || 'staff',
      phone: dto.phone,
    });

    return this.adminsRepo.save(admin);
  }

  async update(id: number, dto: UpdateAdminDto): Promise<Admin> {
    const admin = await this.findOne(id);
    Object.assign(admin, dto);
    return this.adminsRepo.save(admin);
  }

  async remove(id: number): Promise<{ message: string }> {
    const admin = await this.findOne(id);
    await this.adminsRepo.remove(admin);
    return { message: `Admin "${admin.name}" deleted` };
  }
}
