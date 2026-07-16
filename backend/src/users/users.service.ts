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

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async createCustomer(dto: RegisterDto): Promise<User> {
    const passwordHash = await bcrypt.hash(dto.password, this.saltRounds);

    const user = this.usersRepository.create({
      email: dto.email.toLowerCase(),
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone ?? null,
      role: UserRole.CUSTOMER,
      branchId: null,
    });

    return this.usersRepository.save(user);
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }
}
