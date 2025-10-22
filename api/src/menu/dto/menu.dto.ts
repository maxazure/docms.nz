import { IsString, IsOptional, IsEnum, IsObject, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// These enums should match the Prisma schema
export const MenuItemType = {
  PAGE: 'PAGE',      // Single page with blocks
  POST_LIST: 'POST_LIST', // Article/news list
  PRODUCT: 'PRODUCT', // Product catalog
} as const;

export type MenuItemType = keyof typeof MenuItemType;

export class CreateMenuItemDto {
  @ApiProperty({
    description: '菜单项标题',
    example: '关于我们',
  })
  @IsString({ message: '菜单项标题必须是字符串' })
  title: string;

  @ApiProperty({
    description: '菜单项图标',
    example: 'fas fa-info-circle',
    required: false,
  })
  @IsString({ message: '菜单项图标必须是字符串' })
  @IsOptional()
  icon?: string;

  @ApiProperty({
    description: '菜单项类型',
    example: MenuItemType.PAGE,
    enum: MenuItemType,
  })
  @IsEnum(MenuItemType, { message: '菜单项类型必须是有效的枚举值' })
  type: MenuItemType;

  @ApiProperty({
    description: '父级菜单项ID（用于嵌套菜单）',
    example: 'menu-1',
    required: false,
  })
  @IsString({ message: '父级菜单项ID必须是字符串' })
  @IsOptional()
  parentId?: string;

  @ApiProperty({
    description: '排序权重',
    example: 1,
    required: false,
  })
  @IsNumber({}, { message: '排序权重必须是数字' })
  @IsOptional()
  order?: number;

  @ApiProperty({
    description: '是否在导航中显示',
    example: true,
    required: false,
  })
  @IsBoolean({ message: '是否显示必须是布尔值' })
  @IsOptional()
  isVisible?: boolean;

  @ApiProperty({
    description: '是否激活',
    example: true,
    required: false,
  })
  @IsBoolean({ message: '是否激活必须是布尔值' })
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: '关联的页面ID（当type为PAGE时）',
    example: 'page-1',
    required: false,
  })
  @IsString({ message: '关联页面ID必须是字符串' })
  @IsOptional()
  pageId?: string;

  @ApiProperty({
    description: 'URL路径（用于外部链接）',
    example: '/about',
    required: false,
  })
  @IsString({ message: 'URL路径必须是字符串' })
  @IsOptional()
  url?: string;

  @ApiProperty({
    description: '菜单项配置（如过滤条件、显示选项等）',
    example: { category: 'news', limit: 10 },
    required: false,
  })
  @IsObject({ message: '菜单项配置必须是对象' })
  @IsOptional()
  config?: Record<string, any>;
}

export class UpdateMenuItemDto {
  @ApiProperty({
    description: '菜单项标题',
    example: '关于我们（更新）',
    required: false,
  })
  @IsString({ message: '菜单项标题必须是字符串' })
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: '菜单项图标',
    example: 'fas fa-info-circle',
    required: false,
  })
  @IsString({ message: '菜单项图标必须是字符串' })
  @IsOptional()
  icon?: string;

  @ApiProperty({
    description: '排序权重',
    example: 2,
    required: false,
  })
  @IsNumber({}, { message: '排序权重必须是数字' })
  @IsOptional()
  order?: number;

  @ApiProperty({
    description: '是否在导航中显示',
    example: false,
    required: false,
  })
  @IsBoolean({ message: '是否显示必须是布尔值' })
  @IsOptional()
  isVisible?: boolean;

  @ApiProperty({
    description: '是否激活',
    example: false,
    required: false,
  })
  @IsBoolean({ message: '是否激活必须是布尔值' })
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: '关联的页面ID（当type为PAGE时）',
    example: 'page-1',
    required: false,
  })
  @IsString({ message: '关联页面ID必须是字符串' })
  @IsOptional()
  pageId?: string;

  @ApiProperty({
    description: 'URL路径（用于外部链接）',
    example: '/about-updated',
    required: false,
  })
  @IsString({ message: 'URL路径必须是字符串' })
  @IsOptional()
  url?: string;

  @ApiProperty({
    description: '菜单项配置',
    example: { category: 'news', limit: 20 },
    required: false,
  })
  @IsObject({ message: '菜单项配置必须是对象' })
  @IsOptional()
  config?: Record<string, any>;
}