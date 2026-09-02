import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { UserRole } from '@michu/shared';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { User } from '../users/entities/user.entity';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let refreshTokenRepo: jest.Mocked<Repository<RefreshToken>>;

  const mockUser: User = {
    id: 1,
    firstName: 'Test',
    lastName: 'User',
    username: 'testuser',
    email: 'test@example.com',
    passwordHash: 'hashed',
    phone: null,
    gender: null,
    dateOfBirth: null,
    profileImage: null,
    roleId: 1,
    role: UserRole.CUSTOMER,
    branchId: null,
    emailVerified: true,
    phoneVerified: true,
    isActive: true,
    lastLogin: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            findByPhone: jest.fn(),
            createCustomer: jest.fn(),
            validatePassword: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('signed-token'),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: string) => {
              const config: Record<string, string> = {
                JWT_ACCESS_SECRET: 'access-secret',
                JWT_REFRESH_SECRET: 'refresh-secret',
                JWT_ACCESS_EXPIRES_IN: '15m',
                JWT_REFRESH_EXPIRES_IN: '7d',
              };
              return config[key] ?? defaultValue;
            }),
            getOrThrow: jest.fn((key: string) => {
              const config: Record<string, string> = {
                JWT_ACCESS_SECRET: 'access-secret',
                JWT_REFRESH_SECRET: 'refresh-secret',
              };
              return config[key];
            }),
          },
        },
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: {
            create: jest.fn((data) => data),
            save: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
    refreshTokenRepo = module.get(getRepositoryToken(RefreshToken));
  });

  describe('register', () => {
    it('should register a new customer', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.createCustomer.mockResolvedValue(mockUser);
      refreshTokenRepo.save.mockResolvedValue({} as RefreshToken);

      const result = await authService.register({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      });

      expect(result.user.email).toBe('test@example.com');
      expect(result.tokens.accessToken).toBe('signed-token');
    });

    it('should throw ConflictException if email exists', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);

      await expect(
        authService.register({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      usersService.validatePassword.mockResolvedValue(true);
      refreshTokenRepo.save.mockResolvedValue({} as RefreshToken);

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.user.id).toBe('1');
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login({ email: 'test@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
