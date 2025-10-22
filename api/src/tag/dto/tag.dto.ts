import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTagDto {
  @ApiProperty({
    description: '标签名称',
    example: '水培技术',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'URL路径',
    example: 'hydroponics-tech',
  })
  @IsString()
  slug: string;
}

export class UpdateTagDto {
  @ApiProperty({
    description: '标签名称',
    example: '水培技术',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'URL路径',
    example: 'hydroponics-tech',
    required: false,
  })
  @IsString()
  @IsOptional()
  slug?: string;
}

export class TagQueryDto {
  @ApiProperty({
    description: '搜索关键词',
    example: '技术',
    required: false,
  })
  @IsString()
  @IsOptional()
  search?: string;
}

export class TagResponseDto {
  @ApiProperty({
    description: '标签ID',
    example: 'tag-1',
  })
  id: string;

  @ApiProperty({
    description: '标签名称',
    example: '水培技术',
  })
  name: string;

  @ApiProperty({
    description: 'URL路径',
    example: 'hydroponics-tech',
  })
  slug: string;

  @ApiProperty({
    description: '创建时间',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;
}
