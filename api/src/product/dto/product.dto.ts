import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray, IsObject, IsNumber, IsInt, Min, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({ description: '产品名称' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'URL路径' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiPropertyOptional({ description: '产品摘要' })
  @IsString()
  @IsOptional()
  summary?: string;

  @ApiPropertyOptional({ description: '产品描述', example: { type: 'html', data: '<p>描述</p>' } })
  @IsObject()
  @IsOptional()
  description?: any;

  @ApiPropertyOptional({ description: '产品规格', example: { size: '120x60x180cm', capacity: '48 plants' } })
  @IsObject()
  @IsOptional()
  specs?: any;

  @ApiPropertyOptional({ description: '图集(媒体ID数组)', type: [String] })
  @IsObject()
  @IsOptional()
  gallery?: any;

  @ApiPropertyOptional({ description: '价格' })
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({ description: '分类ID' })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ description: '标签ID列表', type: [String] })
  @IsArray()
  @IsOptional()
  tagIds?: string[];

  @ApiPropertyOptional({ description: '是否激活', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: '是否精选', default: false })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @ApiPropertyOptional({ description: 'SEO元信息', example: { title: 'SEO标题', description: 'SEO描述', keywords: ['关键词'] } })
  @IsObject()
  @IsOptional()
  meta?: any;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}

export class ProductQueryDto {
  @ApiPropertyOptional({ description: '页码', default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: '每页数量', default: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ description: '分类ID' })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ description: '搜索关键词' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: '最低价格' })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  minPrice?: number;

  @ApiPropertyOptional({ description: '最高价格' })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  maxPrice?: number;

  @ApiPropertyOptional({ description: '是否激活' })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: '是否精选' })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;
}

export class ProductResponseDto {
  @ApiProperty({ description: '产品ID' })
  id: string;

  @ApiProperty({ description: '名称' })
  name: string;

  @ApiProperty({ description: 'URL路径' })
  slug: string;

  @ApiPropertyOptional({ description: '摘要' })
  summary?: string;

  @ApiPropertyOptional({ description: '描述' })
  description?: any;

  @ApiPropertyOptional({ description: '规格' })
  specs?: any;

  @ApiPropertyOptional({ description: '图集' })
  gallery?: any;

  @ApiPropertyOptional({ description: '价格' })
  price?: number;

  @ApiPropertyOptional({ description: '分类ID' })
  categoryId?: string;

  @ApiPropertyOptional({ description: '标签' })
  tags?: any;

  @ApiProperty({ description: '是否激活' })
  isActive: boolean;

  @ApiProperty({ description: '是否精选' })
  isFeatured: boolean;

  @ApiPropertyOptional({ description: 'SEO元信息' })
  meta?: any;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;
}
