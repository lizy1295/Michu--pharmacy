import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

export interface CustomerResponse {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  status: 'active' | 'inactive';
  createdAt: string;
  lastLogin: string | null;
  emailVerified: boolean;
}

import { CreateCustomerDto, UpdateCustomerDto } from './dto/create-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private mapUserToCustomer(user: User): CustomerResponse {
    return {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email ?? '',
      phone: user.phone ?? '',
      address: '',
      totalOrders: 0,
      totalSpent: 0,
      status: user.isActive ? 'active' : 'inactive',
      createdAt: user.createdAt?.toISOString() ?? new Date().toISOString(),
      lastLogin: user.lastLogin?.toISOString() ?? null,
      emailVerified: user.emailVerified,
    };
  }

  async findAll(): Promise<CustomerResponse[]> {
    const users = await this.userRepository.find({
      where: { role: 'customer' },
      order: { createdAt: 'DESC' },
    });
    return users.map((u) => this.mapUserToCustomer(u));
  }

  async findOne(id: number): Promise<CustomerResponse> {
    const user = await this.userRepository.findOne({
      where: { id, role: 'customer' },
    });
    if (!user) {
      throw new NotFoundException(`Customer with id ${id} not found`);
    }
    return this.mapUserToCustomer(user);
  }

  async create(dto: CreateCustomerDto): Promise<CustomerResponse> {
    const nameParts = dto.name?.trim().split(' ') || [];
    const firstName = nameParts[0] || 'Customer';
    const lastName = nameParts.slice(1).join(' ') || '';

    const user = this.userRepository.create({
      firstName,
      lastName,
      email: dto.email,
      phone: dto.phone ?? null,
      role: 'customer',
      isActive: true,
      emailVerified: false,
      phoneVerified: false,
      passwordHash: '',
    });
    const saved = await this.userRepository.save(user);
    return this.mapUserToCustomer(saved);
  }

  async update(id: number, dto: UpdateCustomerDto): Promise<CustomerResponse> {
    const user = await this.userRepository.findOne({ where: { id, role: 'customer' } });
    if (!user) throw new NotFoundException(`Customer with id ${id} not found`);

    if (dto.isActive !== undefined) {
      user.isActive = dto.isActive;
    }
    if (dto.name) {
      const nameParts = dto.name.trim().split(' ');
      user.firstName = nameParts[0] || user.firstName;
      user.lastName = nameParts.slice(1).join(' ') || user.lastName;
    }
    if (dto.phone) user.phone = dto.phone;
    if (dto.email) user.email = dto.email;

    const saved = await this.userRepository.save(user);
    return this.mapUserToCustomer(saved);
  }

  async remove(id: number): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id, role: 'customer' } });
    if (!user) throw new NotFoundException(`Customer with id ${id} not found`);
    const name = `${user.firstName} ${user.lastName}`.trim();
    await this.userRepository.remove(user);
    return { message: `Customer "${name}" deleted` };
  }

  async getStats(): Promise<{ total: number; active: number; newThisMonth: number }> {
    const total = await this.userRepository.count({ where: { role: 'customer' } });
    const active = await this.userRepository.count({ where: { role: 'customer', isActive: true } });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newThisMonth = await this.userRepository
      .createQueryBuilder('u')
      .where('u.role = :role', { role: 'customer' })
      .andWhere('u.created_at >= :start', { start: startOfMonth })
      .getCount();

    return { total, active, newThisMonth };
  }
}
