import { Injectable, ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { Site, UserRole } from '@prisma/client';
import { UpdateSiteDto, ThemeTokenDto } from './dto';

@Injectable()
export class SiteService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get site configuration
   */
  async getSite(): Promise<Site> {
    // Since this is a single-site CMS, we just get the first (and only) site
    const site = await this.prisma.site.findFirst();

    if (!site) {
      throw new NotFoundException('站点未找到');
    }

    return site;
  }

  /**
   * Update site configuration
   */
  async updateSite(updateData: UpdateSiteDto, user?: any): Promise<Site> {
    // Check permissions - only ADMIN and OWNER can update site settings
    if (user && ![UserRole.ADMIN, UserRole.OWNER].includes(user.role)) {
      throw new ForbiddenException('权限不足');
    }

    const site = await this.getSite();

    const updatedSite = await this.prisma.site.update({
      where: { id: site.id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    });

    return updatedSite;
  }

  /**
   * Update theme tokens
   */
  async updateThemeTokens(themeTokens: ThemeTokenDto, user?: any): Promise<Site> {
    // Check permissions - only ADMIN and OWNER can update theme
    if (user && ![UserRole.ADMIN, UserRole.OWNER].includes(user.role)) {
      throw new ForbiddenException('权限不足');
    }

    // Validate theme tokens
    this.validateThemeTokens(themeTokens.themeTokens);

    const site = await this.getSite();

    const updatedSite = await this.prisma.site.update({
      where: { id: site.id },
      data: {
        themeTokens: themeTokens.themeTokens,
        updatedAt: new Date(),
      },
    });

    return updatedSite;
  }

  /**
   * Validate theme tokens structure
   */
  validateThemeTokens(themeTokens: any): void {
    const requiredFields = ['primaryColor'];
    const validFields = ['primaryColor', 'secondaryColor', 'fontFamily', 'borderRadius', 'fontSize'];
    const colorRegex = /^#[0-9A-Fa-f]{6}$/;

    for (const field of requiredFields) {
      if (!themeTokens[field]) {
        throw new BadRequestException(`主题配置缺少必填字段: ${field}`);
      }
    }

    // Validate color format
    if (themeTokens.primaryColor && !colorRegex.test(themeTokens.primaryColor)) {
      throw new BadRequestException('主色调格式无效，应为十六进制颜色代码');
    }

    // Validate font family
    if (themeTokens.fontFamily && typeof themeTokens.fontFamily !== 'string') {
      throw new BadRequestException('字体配置无效');
    }

    // Validate other fields
    for (const [key, value] of Object.entries(themeTokens)) {
      if (!validFields.includes(key) && (typeof value !== 'string' && typeof value !== 'number')) {
        throw new BadRequestException(`主题配置字段 ${key} 类型无效`);
      }
    }
  }

  /**
   * Get theme configuration schema
   */
  getThemeSchema() {
    return {
      primaryColor: {
        type: 'color',
        label: '主色调',
        default: '#1890ff',
        description: '站点的主要颜色，用于标题、链接、按钮等元素',
        validation: {
          pattern: '^#[0-9A-Fa-f]{6}$',
          message: '必须是有效的十六进制颜色代码',
        },
      },
      secondaryColor: {
        type: 'color',
        label: '辅助色',
        default: '#52c41a',
        description: '站点的次要颜色，用于辅助元素',
        validation: {
          pattern: '^#[0-9A-Fa-f]{6}$',
          message: '必须是有效的十六进制颜色代码',
        },
      },
      fontFamily: {
        type: 'font',
        label: '字体',
        default: 'Inter, system-ui, sans-serif',
        description: '站点字体设置',
        options: ['Inter', 'Arial', 'Helvetica', 'Georgia', 'Times New Roman'],
        validation: {
          type: 'string',
          message: '必须是有效的字体名称',
        },
      },
      borderRadius: {
        type: 'size',
        label: '圆角大小',
        default: '6px',
        description: '元素圆角大小',
        validation: {
          min: 0,
          max: 20,
          message: '圆角大小必须在 0-20px 之间',
        },
      },
      fontSize: {
        type: 'size',
        label: '字体大小',
        default: '16px',
        description: '站点字体大小',
        validation: {
          min: 12,
          max: 24,
          message: '字体大小必须在 12-24px 之间',
        },
      },
    };
  }
}