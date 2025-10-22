import { Test, TestingModule } from '@nestjs/testing';
import { SiteController } from './site.controller';
import { SiteService } from './site.service';
import { ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { UpdateSiteDto } from './dto/update-site.dto';

describe('SiteController (Simple)', () => {
  let siteController: SiteController;
  let siteService: SiteService;

  beforeEach(async () => {
    const mockSiteService = {
      getSite: jest.fn(),
      updateSite: jest.fn(),
      updateThemeTokens: jest.fn(),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [SiteController],
      providers: [
        {
          provide: SiteService,
          useValue: mockSiteService,
        },
      ],
    }).compile();

    siteController = app.get<SiteController>(SiteController);
    siteService = app.get<SiteService>(SiteService);
  });

  it('should be defined', () => {
    expect(siteController).toBeDefined();
    expect(siteService).toBeDefined();
  });

  describe('getSite', () => {
    it('should return site configuration', async () => {
      const siteData = {
        id: 'site-1',
        name: 'Test Site',
        domain: 'test.local',
        locale: 'zh',
        themeTokens: { primaryColor: '#1890ff' },
        settings: { siteName: 'Test Site' },
      };

      (siteService.getSite as jest.Mock).mockResolvedValue(siteData);

      const result = await siteController.getSite();

      expect(siteService.getSite).toHaveBeenCalled();
      expect(result).toEqual({
        success: true,
        data: siteData,
      });
    });
  });

  describe('updateSite', () => {
    it('should update site configuration successfully', async () => {
      const user = { id: 'user-1', role: UserRole.ADMIN };
      const updateDto: UpdateSiteDto = { name: 'Updated Site' };
      const existingSite = {
        id: 'site-1',
        name: 'Test Site',
        domain: 'test.local',
        locale: 'zh',
        themeTokens: { primaryColor: '#1890ff' },
        settings: { siteName: 'Test Site' },
      };
      const updatedSite = { ...existingSite, ...updateDto, updatedAt: new Date() };

      (siteService.getSite as jest.Mock).mockResolvedValue(existingSite);
      (siteService.updateSite as jest.Mock).mockResolvedValue(updatedSite);

      const result = await siteController.updateSite(updateDto, user);

      expect(siteService.updateSite).toHaveBeenCalledWith(updateDto, user);
      expect(result).toEqual({
        success: true,
        message: '站点配置更新成功',
        data: updatedSite,
      });
    });
  });

  describe('updateTheme', () => {
    it('should update theme tokens successfully', async () => {
      const user = { id: 'user-1', role: UserRole.ADMIN };
      const themeDto = {
        themeTokens: {
          primaryColor: '#ff0000',
          secondaryColor: '#00ff00',
          fontFamily: 'Inter',
        },
      };
      const existingSite = {
        id: 'site-1',
        name: 'Test Site',
        domain: 'test.local',
        locale: 'zh',
        themeTokens: { primaryColor: '#1890ff' },
        settings: { siteName: 'Test Site' },
      };
      const updatedSite = {
        ...existingSite,
        themeTokens: { ...existingSite.themeTokens, ...themeDto.themeTokens },
        updatedAt: new Date(),
      };

      (siteService.getSite as jest.Mock).mockResolvedValue(existingSite);
      (siteService.updateThemeTokens as jest.Mock).mockResolvedValue(updatedSite);

      const result = await siteController.updateTheme(themeDto, user);

      expect(siteService.updateThemeTokens).toHaveBeenCalledWith(themeDto, user);
      expect(result).toEqual({
        success: true,
        message: '主题更新成功',
        data: updatedSite.themeTokens,
      });
    });
  });

  describe('Permission Checks', () => {
    it('should handle ForbiddenException from service for non-admin users', async () => {
      const user = { id: 'user-1', role: UserRole.VIEWER };
      const updateDto: UpdateSiteDto = { name: 'Unauthorized Update' };

      // Mock service to throw ForbiddenException
      (siteService.updateSite as jest.Mock).mockRejectedValue(
        new ForbiddenException('权限不足')
      );

      const result = await siteController.updateSite(updateDto, user);

      expect(result).toEqual({
        success: false,
        message: '权限不足',
        data: null,
      });
    });

    it('should handle null user gracefully', async () => {
      const updateDto: UpdateSiteDto = { name: 'No Auth Update' };

      // Mock service to throw an error for null user
      (siteService.updateSite as jest.Mock).mockRejectedValue(
        new Error('用户未登录')
      );

      const result = await siteController.updateSite(updateDto, null);

      expect(result).toEqual({
        success: false,
        message: '更新失败',
        data: null,
      });
    });
  });
});