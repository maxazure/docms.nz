import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray, IsObject, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ContentStatus } from '@prisma/client';

export class CreatePostDto {
  @ApiProperty({ description: '文章标题' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'URL路径' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiPropertyOptional({ description: '摘要' })
  @IsString()
  @IsOptional()
  summary?: string;

  @ApiProperty({ description: '内容', example: { type: 'html', data: '<p>内容</p>' } })
  @IsObject()
  @IsNotEmpty()
  content: any;

  @ApiPropertyOptional({ description: '封面图片ID' })
  @IsString()
  @IsOptional()
  featuredImageId?: string;

  @ApiPropertyOptional({ description: '状态', enum: ContentStatus })
  @IsEnum(ContentStatus)
  @IsOptional()
  status?: ContentStatus;

  @ApiPropertyOptional({ description: '分类ID列表', type: [String] })
  @IsArray()
  @IsOptional()
  categoryIds?: string[];

  @ApiPropertyOptional({ description: '标签ID列表', type: [String] })
  @IsArray()
  @IsOptional()
  tagIds?: string[];

  @ApiPropertyOptional({ description: 'SEO标题' })
  @IsString()
  @IsOptional()
  seoTitle?: string;

  @ApiPropertyOptional({ description: 'SEO描述' })
  @IsString()
  @IsOptional()
  seoDescription?: string;

  @ApiPropertyOptional({ description: 'SEO关键词', type: [String] })
  @IsArray()
  @IsOptional()
  seoKeywords?: string[];
}

export class UpdatePostDto extends PartialType(CreatePostDto) {}

export class PostQueryDto {
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

  @ApiPropertyOptional({ description: '状态', enum: ContentStatus })
  @IsEnum(ContentStatus)
  @IsOptional()
  status?: ContentStatus;

  @ApiPropertyOptional({ description: '分类ID' })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ description: '标签ID' })
  @IsString()
  @IsOptional()
  tagId?: string;

  @ApiPropertyOptional({ description: '搜索关键词' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: '栏目ID' })
  @IsString()
  @IsOptional()
  menuItemId?: string;

  @ApiPropertyOptional({ description: '作者ID' })
  @IsString()
  @IsOptional()
  authorId?: string;
}

export class PostResponseDto {
  @ApiProperty({ description: '文章ID' })
  id: string;

  @ApiProperty({ description: '标题' })
  title: string;

  @ApiProperty({ description: 'URL路径' })
  slug: string;

  @ApiPropertyOptional({ description: '摘要' })
  summary?: string;

  @ApiProperty({ description: '内容' })
  content: any;

  @ApiPropertyOptional({ description: '封面图片ID' })
  featuredImageId?: string;

  @ApiProperty({ description: '状态', enum: ContentStatus })
  status: ContentStatus;

  @ApiProperty({ description: '作者ID' })
  authorId: string;

  @ApiPropertyOptional({ description: '发布时间' })
  publishedAt?: Date;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'SEO标题' })
  seoTitle?: string;

  @ApiPropertyOptional({ description: 'SEO描述' })
  seoDescription?: string;

  @ApiPropertyOptional({ description: 'SEO关键词' })
  seoKeywords?: string[];
}
