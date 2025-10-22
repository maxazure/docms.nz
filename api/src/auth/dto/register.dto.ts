import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({
    description: '邮箱地址',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: '邮箱格式不正确' })
  @MaxLength(255, { message: '邮箱长度不能超过255个字符' })
  email: string;

  @ApiProperty({
    description: '密码',
    example: 'password123',
    minLength: 6,
  })
  @IsString({ message: '密码必须是字符串' })
  @MinLength(6, { message: '密码长度至少为6位' })
  @MaxLength(100, { message: '密码长度不能超过100个字符' })
  password: string;

  @ApiProperty({
    description: '显示名称',
    example: '张三',
  })
  @IsString({ message: '显示名称必须是字符串' })
  @MinLength(1, { message: '显示名称不能为空' })
  @MaxLength(50, { message: '显示名称长度不能超过50个字符' })
  displayName: string;

  @ApiPropertyOptional({
    description: '用户角色（仅供测试，生产环境应禁用）',
    enum: UserRole,
    example: UserRole.VIEWER,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: '无效的角色类型' })
  role?: UserRole;
}