import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SiteService } from './site.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { UpdateSiteDto, ThemeTokenDto } from './dto';
import { User } from '../auth/decorators/user.decorator';

@ApiTags('Site')
@Controller('site')
export class SiteController {
  constructor(private readonly siteService: SiteService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '获取站点配置（公开访问）' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '站点未找到' })
  async getSite() {
    try {
      const site = await this.siteService.getSite();
      return {
        success: true,
        data: site,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '更新站点配置' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async updateSite(@Body() updateSiteDto: UpdateSiteDto, @User() user: any) {
    try {
      const updatedSite = await this.siteService.updateSite(updateSiteDto, user);
      return {
        success: true,
        message: '站点配置更新成功',
        data: updatedSite,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        return {
          success: false,
          message: error.message,
          data: null,
        };
      }
      if (error instanceof ForbiddenException) {
        return {
          success: false,
          message: error.message,
          data: null,
        };
      }
      return {
        success: false,
        message: '更新失败',
        data: null,
      };
    }
  }

  @Put('theme')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '更新主题配置' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 400, description: '主题配置无效' })
  async updateTheme(@Body() themeDto: ThemeTokenDto, @User() user: any) {
    try {
      const updatedSite = await this.siteService.updateThemeTokens(themeDto, user);
      return {
        success: true,
        message: '主题更新成功',
        data: updatedSite.themeTokens,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        return {
          success: false,
          message: error.message,
          data: null,
        };
      }
      return {
        success: false,
        message: '主题更新失败',
        data: null,
      };
    }
  }

  @Get('theme/schema')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '获取主题配置结构' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getThemeSchema() {
    try {
      const schema = this.siteService.getThemeSchema();
      return {
        success: true,
        data: schema,
      };
    } catch (error) {
      return {
        success: false,
        message: '获取主题结构失败',
        data: null,
      };
    }
  }
}