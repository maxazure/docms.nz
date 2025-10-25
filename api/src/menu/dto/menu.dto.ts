import { IsString, IsOptional, IsEnum, IsObject, IsBoolean, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

// These enums should match the Prisma schema
export enum MenuItemType {
  PAGE = 'PAGE',
  POST_LIST = 'POST_LIST',
  PRODUCT = 'PRODUCT',
}

export enum LinkType {
  INTERNAL = 'INTERNAL',
  EXTERNAL = 'EXTERNAL',
}

export class CreateMenuItemDto {
  @ApiProperty({
    description: '菜单代码',
    example: 'main',
  })
  @IsString({ message: '菜单代码必须是字符串' })
  menuCode: string;

  @ApiProperty({
    description: '菜单项标题',
    example: '关于我们',
  })
  @IsString({ message: '菜单项标题必须是字符串' })
  label: string;

  @ApiProperty({
    description: 'URL别名',
    example: 'about',
  })
  @IsString({ message: 'URL别名必须是字符串' })
  slug: string;

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
  @Transform(({ value }) => typeof value === 'string' ? value.toUpperCase() : value)
  @IsEnum(MenuItemType, { message: '菜单项类型必须是有效的枚举值' })
  type: MenuItemType;

  @ApiProperty({
    description: '链接类型',
    example: LinkType.INTERNAL,
    enum: LinkType,
    required: false,
  })
  @Transform(({ value }) => typeof value === 'string' ? value.toUpperCase() : value)
  @IsEnum(LinkType, { message: '链接类型必须是有效的枚举值' })
  @IsOptional()
  linkType?: LinkType;

  @ApiProperty({
    description: '链接目标（外部URL或内部资源ID）',
    example: '/about',
    required: false,
  })
  @IsString({ message: '链接目标必须是字符串' })
  @IsOptional()
  linkTarget?: string;

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
}

export class UpdateMenuItemDto {
  @ApiProperty({
    description: '菜单项标题',
    example: '关于我们（更新）',
    required: false,
  })
  @IsString({ message: '菜单项标题必须是字符串' })
  @IsOptional()
  label?: string;

  @ApiProperty({
    description: 'URL别名',
    example: 'about-updated',
    required: false,
  })
  @IsString({ message: 'URL别名必须是字符串' })
  @IsOptional()
  slug?: string;

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
    description: '链接类型',
    example: LinkType.INTERNAL,
    enum: LinkType,
    required: false,
  })
  @Transform(({ value }) => typeof value === 'string' ? value.toUpperCase() : value)
  @IsEnum(LinkType, { message: '链接类型必须是有效的枚举值' })
  @IsOptional()
  linkType?: LinkType;

  @ApiProperty({
    description: '链接目标（外部URL或内部资源ID）',
    example: '/about',
    required: false,
  })
  @IsString({ message: '链接目标必须是字符串' })
  @IsOptional()
  linkTarget?: string;
}