import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
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

  @ApiProperty({
    description: '用户角色',
    enum: UserRole,
    example: UserRole.VIEWER,
  })
  @IsEnum(UserRole, { message: '无效的角色类型' })
  role: UserRole;
}

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: '邮箱地址',
    example: 'user@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  @MaxLength(255, { message: '邮箱长度不能超过255个字符' })
  email?: string;

  @ApiPropertyOptional({
    description: '密码（如果需要修改）',
    example: 'newpassword123',
    minLength: 6,
  })
  @IsOptional()
  @IsString({ message: '密码必须是字符串' })
  @MinLength(6, { message: '密码长度至少为6位' })
  @MaxLength(100, { message: '密码长度不能超过100个字符' })
  password?: string;

  @ApiPropertyOptional({
    description: '显示名称',
    example: '张三',
  })
  @IsOptional()
  @IsString({ message: '显示名称必须是字符串' })
  @MinLength(1, { message: '显示名称不能为空' })
  @MaxLength(50, { message: '显示名称长度不能超过50个字符' })
  displayName?: string;

  @ApiPropertyOptional({
    description: '用户角色',
    enum: UserRole,
    example: UserRole.VIEWER,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: '无效的角色类型' })
  role?: UserRole;
}

export class UserListQuery {
  @ApiPropertyOptional({
    description: '页码',
    example: 1,
    default: 1,
  })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({
    description: '每页数量',
    example: 10,
    default: 10,
  })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({
    description: '搜索关键词（邮箱或显示名称）',
    example: 'admin',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: '角色筛选',
    enum: UserRole,
    example: UserRole.ADMIN,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
