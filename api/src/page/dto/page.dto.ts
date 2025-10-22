import { IsString, IsOptional, IsEnum, IsObject, IsBoolean, IsArray, IsNumber, ValidateNested, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PageStatus, BlockType } from '@prisma/client';
import { Type } from 'class-transformer';

// 页面区块基础结构
export class BaseBlockDto {
  @ApiProperty({
    description: '区块类型',
    enum: BlockType,
    example: BlockType.TEXT,
  })
  @IsEnum(BlockType)
  type: BlockType;

  @ApiProperty({
    description: '排序权重',
    example: 1,
  })
  @IsNumber()
  order: number;

  @ApiProperty({
    description: '区块可见性',
    example: true,
    required: false,
  })
  @IsBoolean()
  isVisible?: boolean = true;

  @ApiProperty({
    description: '区块配置',
    example: { content: 'Hello World', fontSize: '16px' },
    required: false,
  })
  @IsObject()
  @IsOptional()
  props?: Record<string, any>;
}

// 创建页面DTO
export class CreatePageDto {
  @ApiProperty({
    description: '页面标题',
    example: '关于我们',
  })
  @IsString({ message: '页面标题必须是字符串' })
  @IsNotEmpty({ message: '页面标题不能为空' })
  title: string;

  @ApiProperty({
    description: '页面URL路径',
    example: 'about-us',
  })
  @IsString({ message: '页面路径必须是字符串' })
  @IsNotEmpty({ message: '页面路径不能为空' })
  slug: string;

  @ApiProperty({
    description: '页面状态',
    enum: PageStatus,
    example: PageStatus.DRAFT,
  })
  @IsEnum(PageStatus, { message: '页面状态必须是有效的枚举值' })
  status: PageStatus;

  @ApiProperty({
    description: '页面区块列表',
    type: [BaseBlockDto],
    example: [
      {
        type: BlockType.TEXT,
        order: 1,
        isVisible: true,
        props: { content: '欢迎使用我们的CMS系统' }
      }
    ]
  })
  @IsArray({ message: '区块列表必须是数组' })
  @ValidateNested({ each: true })
  @Type(() => BaseBlockDto)
  blocks: BaseBlockDto[];

  @ApiProperty({
    description: '关联菜单项ID',
    example: 'menu-1',
    required: false,
  })
  @IsString({ message: '关联菜单项ID必须是字符串' })
  @IsOptional()
  menuItemId?: string;

  @ApiProperty({
    description: 'SEO元信息',
    example: { title: '关于我们 - 公司名称', description: '了解我们公司的详细信息' },
    required: false,
  })
  @IsObject({ message: 'SEO元信息必须是对象' })
  @IsOptional()
  meta?: Record<string, any>;
}

// 更新页面DTO
export class UpdatePageDto {
  @ApiProperty({
    description: '页面标题',
    example: '关于我们',
    required: false,
  })
  @IsString({ message: '页面标题必须是字符串' })
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: '页面状态',
    enum: PageStatus,
    example: PageStatus.PUBLISHED,
    required: false,
  })
  @IsEnum(PageStatus, { message: '页面状态必须是有效的枚举值' })
  @IsOptional()
  status?: PageStatus;

  @ApiProperty({
    description: '页面区块列表',
    type: [BaseBlockDto],
    required: false,
  })
  @IsArray({ message: '区块列表必须是数组' })
  @ValidateNested({ each: true })
  @Type(() => BaseBlockDto)
  @IsOptional()
  blocks?: BaseBlockDto[];

  @ApiProperty({
    description: 'SEO元信息',
    example: { title: '关于我们 - 公司名称', description: '了解我们公司的详细信息' },
    required: false,
  })
  @IsObject({ message: 'SEO元信息必须是对象' })
  @IsOptional()
  meta?: Record<string, any>;
}

// 页面查询DTO
export class PageQueryDto {
  @ApiProperty({
    description: '页码',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiProperty({
    description: '每页数量',
    example: 10,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;

  @ApiProperty({
    description: '搜索关键词',
    example: '关于',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: '页面状态过滤',
    enum: PageStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(PageStatus)
  status?: PageStatus;

  @ApiProperty({
    description: '是否只显示可见页面',
    example: true,
    required: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  visibleOnly?: boolean;
}

// 页面响应DTO
export class PageResponseDto {
  @ApiProperty({
    description: '页面ID',
    example: 'page-1',
  })
  id: string;

  @ApiProperty({
    description: '页面标题',
    example: '关于我们',
  })
  title: string;

  @ApiProperty({
    description: '页面URL路径',
    example: 'about-us',
  })
  slug: string;

  @ApiProperty({
    description: '页面状态',
    enum: PageStatus,
    example: PageStatus.PUBLISHED,
  })
  status: PageStatus;

  @ApiProperty({
    description: '页面区块列表',
    type: [BaseBlockDto],
  })
  blocks: BaseBlockDto[];

  @ApiProperty({
    description: 'SEO元信息',
    example: { title: '关于我们 - 公司名称', description: '了解我们公司的详细信息' },
  })
  meta?: Record<string, any>;

  @ApiProperty({
    description: '创建时间',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '更新时间',
    example: '2023-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: '发布时间',
    example: '2023-01-01T00:00:00.000Z',
    required: false,
  })
  publishedAt?: Date;
}