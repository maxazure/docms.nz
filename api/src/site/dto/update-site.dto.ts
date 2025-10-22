import { IsString, IsOptional, IsUrl, IsObject, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSiteDto {
  @ApiProperty({
    description: '站点名称',
    example: '我的公司官网',
    required: false,
  })
  @IsString({ message: '站点名称必须是字符串' })
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: '站点域名',
    example: 'company.example.com',
    required: false,
  })
  @IsString({ message: '站点域名必须是字符串' })
  @IsOptional()
  @IsUrl()
  domain?: string;

  @ApiProperty({
    description: '站点语言',
    example: 'zh',
    required: false,
  })
  @IsString({ message: '站点语言必须是字符串' })
  @IsOptional()
  locale?: string;

  @ApiProperty({
    description: '站点描述',
    example: '我的公司官网',
    required: false,
  })
  @IsString({ message: '站点描述必须是字符串' })
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: '站点设置',
    example: {
      siteName: 'My Company',
      logoUrl: 'https://example.com/logo.png',
      faviconUrl: 'https://example.com/favicon.ico',
    },
    required: false,
  })
  @IsObject({ message: '站点设置必须是对象' })
  @IsOptional()
  settings?: Record<string, any>;
}

export class ThemeTokenDto {
  @ApiProperty({
    description: '主题配置',
    example: {
      primaryColor: '#1890ff',
      fontFamily: 'Inter',
      borderRadius: '8px',
      fontSize: '16px',
    },
  })
  @IsObject({ message: '主题配置必须是对象' })
  @ValidateNested()
  themeTokens: Record<string, any>;
}