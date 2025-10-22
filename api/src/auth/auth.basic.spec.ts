import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service.simple';
import { PrismaService } from '../common/services/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UserRole } from '@prisma/client';

describe('AuthService (Basic)', () => {
  let authService: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const mockPrismaService = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const mockJwtService = {
      sign: jest.fn().mockReturnValue('mocked-jwt-token'),
      verify: jest.fn().mockReturnValue({ userId: 'test-user-id', role: 'OWNER' }),
    };

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authService = app.get<AuthService>(AuthService);
    prisma = app.get<PrismaService>(PrismaService);
    jwtService = app.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
    expect(prisma).toBeDefined();
    expect(jwtService).toBeDefined();
  });

  describe('register', () => {
    it('should create new user successfully', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User',
      };

      const newUser = {
        id: 'user-1',
        email: 'test@example.com',
        displayName: 'Test User',
        role: UserRole.VIEWER,
        createdAt: new Date(),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null); // Email not found
      (prisma.user.create as jest.Mock).mockResolvedValue(newUser);

      // Mock bcrypt.hash
      const bcrypt = require('bcrypt');
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-password');

      const result = await authService.register(registerDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          passwordHash: 'hashed-password',
          displayName: 'Test User',
          role: UserRole.VIEWER,
        },
      });
      expect(result).toEqual(newUser);
    });

    it('should throw BadRequestException if email already exists', async () => {
      const registerDto = {
        email: 'existing@example.com',
        password: 'password123',
        displayName: 'Test User',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'existing-user',
        email: 'existing@example.com',
      });

      await expect(authService.register(registerDto)).rejects.toThrow(
        new BadRequestException('该邮箱已被注册'),
      );
    });
  });

  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      const user = {
        id: 'user-1',
        email: 'test@example.com',
        displayName: 'Test User',
        role: UserRole.OWNER,
      };

      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      jest.spyOn(authService, 'validateUser').mockResolvedValue(user);

      const result = await authService.login(loginDto);

      expect(authService.validateUser).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(jwtService.sign).toHaveBeenCalledWith({
        userId: 'user-1',
        email: 'test@example.com',
        role: UserRole.OWNER,
      });
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        accessToken: 'mocked-jwt-token',
        refreshToken: 'mocked-jwt-token',
        user: {
          id: 'user-1',
          email: 'test@example.com',
          displayName: 'Test User',
          role: UserRole.OWNER,
        },
      });
    });
  });
});