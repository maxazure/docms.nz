import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/services/prisma.service';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const mockJwtService = {
      sign: jest.fn().mockReturnValue('mocked-jwt-token'),
      verify: jest.fn().mockReturnValue({ userId: 'test-user-id', role: 'OWNER' }),
    };

    const mockPrismaService = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const mockAuthService = {
      validateUser: jest.fn(),
      login: jest.fn(),
      register: jest.fn(),
      refreshToken: jest.fn(),
      resetPassword: jest.fn(),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    authController = app.get<AuthController>(AuthController);
    authService = app.get<AuthService>(AuthService);
    prisma = app.get<PrismaService>(PrismaService);
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User',
      };

      const expectedUser = {
        id: 'user-1',
        email: 'test@example.com',
        displayName: 'Test User',
        role: 'VIEWER',
        createdAt: new Date(),
      };

      (authService.register as jest.Mock).mockResolvedValue(expectedUser);

      const result = await authController.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual({
        success: true,
        message: '用户注册成功',
        data: expectedUser,
      });
    });

    it('should throw BadRequestException for invalid email format', async () => {
      const registerDto = {
        email: 'invalid-email',
        password: 'password123',
        displayName: 'Test User',
      };

      (authService.register as jest.Mock).mockRejectedValue(
        new BadRequestException('邮箱格式不正确'),
      );

      await expect(authController.register(registerDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for duplicate email', async () => {
      const registerDto = {
        email: 'existing@example.com',
        password: 'password123',
        displayName: 'Test User',
      };

      (authService.register as jest.Mock).mockRejectedValue(
        new BadRequestException('该邮箱已被注册'),
      );

      await expect(authController.register(registerDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for weak password', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: '123', // Weak password
        displayName: 'Test User',
      };

      (authService.register as jest.Mock).mockRejectedValue(
        new BadRequestException('密码长度至少为6位'),
      );

      await expect(authController.register(registerDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('POST /auth/login', () => {
    it('should login user successfully', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const expectedResponse = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: {
          id: 'user-1',
          email: 'test@example.com',
          displayName: 'Test User',
          role: 'OWNER',
        },
      };

      (authService.login as jest.Mock).mockResolvedValue(expectedResponse);

      const result = await authController.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual({
        success: true,
        message: '登录成功',
        data: expectedResponse,
      });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto = {
        email: 'wrong@example.com',
        password: 'wrongpassword',
      };

      (authService.login as jest.Mock).mockRejectedValue(
        new UnauthorizedException('邮箱或密码错误'),
      );

      await expect(authController.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      (authService.login as jest.Mock).mockRejectedValue(
        new UnauthorizedException('邮箱或密码错误'),
      );

      await expect(authController.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('POST /auth/refresh', () => {
    it('should refresh tokens successfully', async () => {
      const refreshTokenDto = {
        refreshToken: 'valid-refresh-token',
      };

      const expectedResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      (authService.refreshToken as jest.Mock).mockResolvedValue(expectedResponse);

      const result = await authController.refreshToken(refreshTokenDto);

      expect(authService.refreshToken).toHaveBeenCalledWith(
        refreshTokenDto.refreshToken,
      );
      expect(result).toEqual({
        success: true,
        message: 'Token刷新成功',
        data: expectedResponse,
      });
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      const refreshTokenDto = {
        refreshToken: 'invalid-refresh-token',
      };

      (authService.refreshToken as jest.Mock).mockRejectedValue(
        new UnauthorizedException('无效的刷新令牌'),
      );

      await expect(authController.refreshToken(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('POST /auth/reset-password', () => {
    it('should reset password successfully', async () => {
      const resetPasswordDto = {
        email: 'test@example.com',
      };

      (authService.resetPassword as jest.Mock).mockResolvedValue(undefined);

      const result = await authController.resetPassword(resetPasswordDto);

      expect(authService.resetPassword).toHaveBeenCalledWith(
        resetPasswordDto.email,
      );
      expect(result).toEqual({
        success: true,
        message: '密码重置邮件已发送',
      });
    });

    it('should throw BadRequestException for non-existent email', async () => {
      const resetPasswordDto = {
        email: 'nonexistent@example.com',
      };

      (authService.resetPassword as jest.Mock).mockRejectedValue(
        new BadRequestException('该邮箱未注册'),
      );

      await expect(authController.resetPassword(resetPasswordDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout successfully', async () => {
      const user = { id: 'user-1', email: 'test@example.com' };

      const result = await authController.logout(user);

      expect(result).toEqual({
        success: true,
        message: '退出登录成功',
      });
    });
  });

  describe('GET /auth/profile', () => {
    it('should return user profile', async () => {
      const user = {
        id: 'user-1',
        email: 'test@example.com',
        displayName: 'Test User',
        role: 'OWNER',
      };

      const result = await authController.getProfile(user);

      expect(result).toEqual({
        success: true,
        data: user,
      });
    });
  });
});