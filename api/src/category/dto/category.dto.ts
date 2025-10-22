import { IsString, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: '分类名称',
    example: '家庭水培设备',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'URL路径',
    example: 'home-hydroponics',
  })
  @IsString()
  slug: string;

  @ApiProperty({
    description: '父分类ID',
    example: 'cat-parent-id',
    required: false,
  })
  @IsString()
  @IsOptional()
  parentId?: string;

  @ApiProperty({
    description: '排序权重',
    example: 1,
    default: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;
}

export class UpdateCategoryDto {
  @ApiProperty({
    description: '分类名称',
    example: '家庭水培设备',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'URL路径',
    example: 'home-hydroponics',
    required: false,
  })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({
    description: '父分类ID',
    example: 'cat-parent-id',
    required: false,
  })
  @IsString()
  @IsOptional()
  parentId?: string;

  @ApiProperty({
    description: '排序权重',
    example: 1,
    required: false,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;

  @ApiProperty({
    description: '是否激活',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class CategoryQueryDto {
  @ApiProperty({
    description: '是否包含未激活的分类',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  includeInactive?: boolean;
}

export class CategoryResponseDto {
  @ApiProperty({
    description: '分类ID',
    example: 'cat-1',
  })
  id: string;

  @ApiProperty({
    description: '分类名称',
    example: '家庭水培设备',
  })
  name: string;

  @ApiProperty({
    description: 'URL路径',
    example: 'home-hydroponics',
  })
  slug: string;

  @ApiProperty({
    description: '父分类ID',
    example: 'cat-parent-id',
    required: false,
  })
  parentId?: string;

  @ApiProperty({
    description: '排序权重',
    example: 1,
  })
  order: number;

  @ApiProperty({
    description: '是否激活',
    example: true,
  })
  isActive: boolean;

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
    description: '父分类',
    required: false,
  })
  parent?: CategoryResponseDto;

  @ApiProperty({
    description: '子分类列表',
    type: [CategoryResponseDto],
    required: false,
  })
  children?: CategoryResponseDto[];
}
