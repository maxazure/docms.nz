import { IsString, IsOptional, IsNumber, IsEnum, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
  AUDIO = 'audio',
  OTHER = 'other',
}

export class CreateMediaDto {
  @ApiProperty({
    description: '文件名',
    example: 'company-logo.png',
  })
  @IsString()
  filename: string;

  @ApiProperty({
    description: '文件类型',
    example: MediaType.IMAGE,
    enum: MediaType,
  })
  @IsEnum(MediaType)
  type: MediaType;

  @ApiProperty({
    description: 'MIME类型',
    example: 'image/png',
  })
  @IsString()
  mimeType: string;

  @ApiProperty({
    description: '文件大小（字节）',
    example: 12345,
  })
  @IsNumber()
  size: number;

  @ApiProperty({
    description: '文件路径',
    example: '/uploads/2024/01/company-logo.png',
  })
  @IsString()
  path: string;

  @ApiProperty({
    description: '文件URL',
    example: 'https://example.com/uploads/2024/01/company-logo.png',
    required: false,
  })
  @IsString()
  @IsOptional()
  url?: string;

  @ApiProperty({
    description: '文件元数据（如图片尺寸、视频时长等）',
    example: { width: 800, height: 600 },
    required: false,
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiProperty({
    description: '文件描述',
    example: '公司Logo',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: '替代文本（用于无障碍访问）',
    example: 'Docms公司Logo',
    required: false,
  })
  @IsString()
  @IsOptional()
  altText?: string;
}

export class UpdateMediaDto {
  @ApiProperty({
    description: '文件描述',
    example: '更新的文件描述',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: '替代文本',
    example: '更新的替代文本',
    required: false,
  })
  @IsString()
  @IsOptional()
  altText?: string;

  @ApiProperty({
    description: '文件元数据',
    example: { width: 1200, height: 800 },
    required: false,
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}