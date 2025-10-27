import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/services/prisma.service';
import { User, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto } from './dto';

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: Pick<User, 'id' | 'email' | 'displayName' | 'role'>;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<Partial<User> | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    // Remove password hash from returned object
    const { passwordHash, ...result } = user;
    return result;
  }

  async register(registerDto: RegisterDto): Promise<Partial<User>> {
    const { email, password, displayName, role } = registerDto;

    // Check if email is valid format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException('邮箱格式不正确');
    }

    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('该邮箱已被注册');
    }

    // Password validation
    if (password.length < 6) {
      throw new BadRequestException('密码长度至少为6位');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user with role (default to VIEWER if not provided)
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        displayName,
        role: role || UserRole.VIEWER,
      },
    });

    // Remove password hash from returned object
    const { passwordHash: _, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
        expiresIn: '15m',
      });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    try {
      const payload = this.jwtService.verify(refreshToken) as TokenPayload;

      const newAccessToken = this.jwtService.sign(payload, {
        expiresIn: '15m',
      });
      const newRefreshToken = this.jwtService.sign(payload, {
        expiresIn: '7d',
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('无效的刷新令牌');
    }
  }

  async resetPassword(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('该邮箱未注册');
    }

    // Generate random password
    const newPassword = this.generateRandomPassword();

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update user password
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    // In a real application, you would send an email with the new password
    // For now, we'll just log it (in development only)
    if (process.env.NODE_ENV === 'development') {
      console.log(`Password reset for ${email}: ${newPassword}`);
    }

    // TODO: Implement email service to send password reset email
  }

  generateRandomPassword(): string {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset.charAt(randomIndex);
    }

    return password;
  }

  async updateProfile(userId: string, updateData: {
    displayName?: string;
    avatar?: string;
  }): Promise<Partial<User>> {
    // Filter out undefined values and only include supported fields
    const dataToUpdate: any = {};
    if (updateData.displayName !== undefined) {
      dataToUpdate.displayName = updateData.displayName;
    }
    if (updateData.avatar !== undefined) {
      dataToUpdate.avatar = updateData.avatar;
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
    });

    const { passwordHash, ...result } = user;
    return result;
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    // Verify old password
    const isPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new BadRequestException('当前密码不正确');
    }

    // Validate new password
    if (newPassword.length < 6) {
      throw new BadRequestException('新密码长度至少为6位');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }
}