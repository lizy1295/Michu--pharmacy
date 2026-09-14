import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@michu/shared';
import { User } from './entities/user.entity';
import { RegisterDto } from '../auth/dto/auth.dto';

@Injectable()
export class UsersService {
  private readonly saltRounds = 12;

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string, includePassword = false): Promise<User | null> {
    const query = this.usersRepository.createQueryBuilder('user').where('user.email = :email', {
      email: email.toLowerCase(),
    });

    if (includePassword) {
      query.addSelect('user.passwordHash');
    }

    return query.getOne();
  }

  async findByPhone(phone: string, includePassword = false): Promise<User | null> {
    // Normalise: strip spaces and dashes, ensure leading + is kept
    const normalized = phone.replace(/[\s\-]/g, '');
    const query = this.usersRepository
      .createQueryBuilder('user')
      .where('REPLACE(REPLACE(user.phone, \' \', \'\'), \'-\', \'\') = :phone', { phone: normalized });

    if (includePassword) {
      query.addSelect('user.passwordHash');
    }

    return query.getOne();
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id: Number(id) } });
  }

  async createCustomer(dto: RegisterDto): Promise<User> {
    const passwordHash = await bcrypt.hash(dto.password, this.saltRounds);

    const user = this.usersRepository.create({
      email: dto.email ? dto.email.toLowerCase() : null,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone ?? null,
      role: UserRole.CUSTOMER,
      roleId: 1,
      branchId: null,
      isActive: true,
    });

    return this.usersRepository.save(user);
  }

  async createStaffUser(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    roleId?: number;
    phone?: string;
    branchId?: string;
  }): Promise<User> {
    const passwordHash = await bcrypt.hash(data.password, this.saltRounds);

    const user = this.usersRepository.create({
      email: data.email.toLowerCase(),
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone ?? null,
      role: data.role,
      roleId: data.roleId ?? 2,
      branchId: data.branchId ?? null,
      isActive: true,
      emailVerified: true,
    });

    return this.usersRepository.save(user);
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    if (!user.passwordHash) return false;

    if (user.passwordHash.startsWith('$2a$') || user.passwordHash.startsWith('$2b$')) {
      return bcrypt.compare(password, user.passwordHash);
    }

    // Plaintext fallback upgrade if needed
    if (user.passwordHash === password) {
      user.passwordHash = await bcrypt.hash(password, this.saltRounds);
      await this.usersRepository.save(user);
      return true;
    }

    return false;
  }
}

