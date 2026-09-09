import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { createHash } from 'crypto';
import { UserRole } from '@michu/shared';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { User } from '../users/entities/user.entity';
import { MailService } from '../mail/mail.service';
import { NotificationService } from '../mail/notification.service';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let refreshTokenRepo: jest.Mocked<Repository<RefreshToken>>;
  let passwordResetTokenRepo: any;
  let notificationService: jest.Mocked<NotificationService>;

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

  const mockQueryBuilder = {
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue({ affected: 1 }),
  };

  const mockUserRepo = {
    update: jest.fn().mockResolvedValue({ affected: 1 }),
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
          provide: MailService,
          useValue: {
            sendPasswordReset: jest.fn().mockResolvedValue(undefined),
            sendPasswordResetOtp: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: NotificationService,
          useValue: {
            sendOtp: jest.fn().mockResolvedValue(undefined),
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
        {
          provide: getRepositoryToken(PasswordResetToken),
          useValue: {
            create: jest.fn((data) => data),
            save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 1, ...data })),
            findOne: jest.fn(),
            update: jest.fn().mockResolvedValue({ affected: 1 }),
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
            manager: {
              getRepository: jest.fn(() => mockUserRepo),
            },
          },
        },
      ],
    }).compile();

    authService = module.get(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
    refreshTokenRepo = module.get(getRepositoryToken(RefreshToken));
    passwordResetTokenRepo = module.get(getRepositoryToken(PasswordResetToken));
    notificationService = module.get(NotificationService);
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

  describe('forgotPassword (OTP generation & anti-enumeration)', () => {
    it('should return safe message when email is not registered (anti-enumeration)', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      const res = await authService.forgotPassword('nonexistent@example.com');
      expect(res.message).toContain('verification code has been sent');
      expect(notificationService.sendOtp).not.toHaveBeenCalled();
    });

    it('should generate 6-digit OTP, store hashed OTP, and dispatch notification when user exists', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);

      const res = await authService.forgotPassword('test@example.com');
      expect(res.message).toContain('verification code has been sent');
      expect(passwordResetTokenRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUser.id,
          attempts: 0,
          otpHash: expect.any(String),
          expiresAt: expect.any(Date),
        }),
      );
      expect(notificationService.sendOtp).toHaveBeenCalledWith(
        expect.objectContaining({ email: mockUser.email }),
        expect.stringMatching(/^\d{6}$/),
      );
    });
  });

  describe('verifyOtp', () => {
    const validOtp = '654321';
    const otpHash = createHash('sha256').update(validOtp).digest('hex');

    it('should throw BadRequestException if user does not exist', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        authService.verifyOtp('unknown@example.com', '123456'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if OTP is expired', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      passwordResetTokenRepo.findOne.mockResolvedValue({
        id: 1,
        userId: mockUser.id,
        otpHash,
        attempts: 0,
        expiresAt: new Date(Date.now() - 1000), // expired
      });

      await expect(
        authService.verifyOtp('test@example.com', validOtp),
      ).rejects.toThrow('expired');
    });

    it('should increment attempts and reject when invalid OTP is provided', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      passwordResetTokenRepo.findOne.mockResolvedValue({
        id: 1,
        userId: mockUser.id,
        otpHash,
        attempts: 0,
        expiresAt: new Date(Date.now() + 600000),
      });

      await expect(
        authService.verifyOtp('test@example.com', '000000'),
      ).rejects.toThrow('2 attempt(s) remaining');
      expect(passwordResetTokenRepo.update).toHaveBeenCalledWith(1, { attempts: 1 });
    });

    it('should invalidate code when attempts exceed limit (>=3)', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      passwordResetTokenRepo.findOne.mockResolvedValue({
        id: 1,
        userId: mockUser.id,
        otpHash,
        attempts: 2, // 2 prior failed attempts, next failed attempt will hit limit
        expiresAt: new Date(Date.now() + 600000),
      });

      await expect(
        authService.verifyOtp('test@example.com', '000000'),
      ).rejects.toThrow('Too many failed attempts');
      expect(passwordResetTokenRepo.update).toHaveBeenCalledWith(1, expect.objectContaining({ usedAt: expect.any(Date) }));
    });

    it('should return resetToken when valid OTP is provided', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      passwordResetTokenRepo.findOne.mockResolvedValue({
        id: 1,
        userId: mockUser.id,
        otpHash,
        attempts: 0,
        expiresAt: new Date(Date.now() + 600000),
      });

      const res = await authService.verifyOtp('test@example.com', validOtp);
      expect(res.resetToken).toBeDefined();
      expect(res.resetToken.length).toBe(64); // 32 bytes hex
      expect(res.message).toContain('Code verified successfully');
      expect(passwordResetTokenRepo.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          verifiedAt: expect.any(Date),
          resetTokenHash: expect.any(String),
        }),
      );
    });
  });

  describe('resetPassword', () => {
    const rawResetToken = 'a'.repeat(64);
    const resetTokenHash = createHash('sha256').update(rawResetToken).digest('hex');

    it('should throw BadRequestException if token is missing or password is too short', async () => {
      await expect(
        authService.resetPassword('', 'short'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if resetToken is not found or not verified', async () => {
      passwordResetTokenRepo.findOne.mockResolvedValue(null);

      await expect(
        authService.resetPassword(rawResetToken, 'NewSecurePass123!'),
      ).rejects.toThrow('Invalid or expired reset session');
    });

    it('should update password and mark token as used when valid resetToken is provided', async () => {
      passwordResetTokenRepo.findOne.mockResolvedValue({
        id: 1,
        userId: mockUser.id,
        resetTokenHash,
        verifiedAt: new Date(),
        usedAt: null,
        expiresAt: new Date(Date.now() + 600000),
        user: mockUser,
      });

      const res = await authService.resetPassword(rawResetToken, 'NewSecurePass123!');
      expect(res.message).toContain('Password updated successfully');
      expect(mockUserRepo.update).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({ passwordHash: expect.any(String) }),
      );
      expect(passwordResetTokenRepo.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ usedAt: expect.any(Date) }),
      );
    });
  });
});
