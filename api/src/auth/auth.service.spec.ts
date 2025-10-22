import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../common/services/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';

describe('AuthService', () => {
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

  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      const user = {
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: await bcrypt.hash('password123', 10),
        displayName: 'Test User',
        role: UserRole.OWNER,
        createdAt: new Date(),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);

      const result = await authService.validateUser('test@example.com', 'password123');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toEqual({
        id: 'user-1',
        email: 'test@example.com',
        displayName: 'Test User',
        role: UserRole.OWNER,
      });
    });

    it('should return null if user does not exist', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await authService.validateUser('nonexistent@example.com', 'password123');

      expect(result).toBeNull();
    });

    it('should return null if password is incorrect', async () => {
      const user = {
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: await bcrypt.hash('password123', 10),
        displayName: 'Test User',
        role: UserRole.OWNER,
        createdAt: new Date(),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);

      const result = await authService.validateUser('test@example.com', 'wrongpassword');

      expect(result).toBeNull();
    });
  });

  describe('register', () => {
    it('should create new user successfully', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User',
      };

      const hashedPassword = await bcrypt.hash('password123', 10);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as any);

      const newUser = {
        id: 'user-1',
        email: 'test@example.com',
        displayName: 'Test User',
        role: UserRole.VIEWER,
        createdAt: new Date(),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null); // Email not found
      (prisma.user.create as jest.Mock).mockResolvedValue(newUser);

      const result = await authService.register(registerDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          passwordHash: hashedPassword,
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

    it('should throw BadRequestException for weak password', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: '123', // Weak password
        displayName: 'Test User',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(authService.register(registerDto)).rejects.toThrow(
        new BadRequestException('密码长度至少为6位'),
      );
    });

    it('should throw BadRequestException for invalid email format', async () => {
      const registerDto = {
        email: 'invalid-email',
        password: 'password123',
        displayName: 'Test User',
      };

      await expect(authService.register(registerDto)).rejects.toThrow(
        new BadRequestException('邮箱格式不正确'),
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

      (jwtService.sign as jest.Mock)
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      const result = await authService.login(loginDto);

      expect(authService.validateUser).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(jwtService.sign).toHaveBeenCalledWith({
        userId: 'user-1',
        email: 'test@example.com',
        role: UserRole.OWNER,
      });
      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user,
      });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      jest.spyOn(authService, 'validateUser').mockResolvedValue(null);

      await expect(authService.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('邮箱或密码错误'),
      );
    });
  });

  describe('refreshToken', () => {
    it('should generate new tokens for valid refresh token', async () => {
      const payload = {
        userId: 'user-1',
        email: 'test@example.com',
        role: UserRole.OWNER,
      };

      (jwtService.verify as jest.Mock).mockReturnValue(payload);
      (jwtService.sign as jest.Mock)
        .mockReturnValueOnce('new-access-token')
        .mockReturnValueOnce('new-refresh-token');

      const result = await authService.refreshToken('valid-refresh-token');

      expect(jwtService.verify).toHaveBeenCalledWith('valid-refresh-token');
      expect(jwtService.sign).toHaveBeenCalledWith(payload);
      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      (jwtService.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(authService.refreshToken('invalid-token')).rejects.toThrow(
        new UnauthorizedException('无效的刷新令牌'),
      );
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const user = {
        id: 'user-1',
        email: 'test@example.com',
      };

      const newPassword = 'newRandomPassword123';

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
      jest.spyOn(authService, 'generateRandomPassword').mockReturnValue(newPassword);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-new-password' as any);

      (prisma.user.update as jest.Mock).mockResolvedValue({});

      await authService.resetPassword('test@example.com');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(authService.generateRandomPassword).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { passwordHash: 'hashed-new-password' },
      });
    });

    it('should throw BadRequestException if email does not exist', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(authService.resetPassword('nonexistent@example.com')).rejects.toThrow(
        new BadRequestException('该邮箱未注册'),
      );
    });
  });
});