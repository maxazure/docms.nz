import { Test, TestingModule } from '@nestjs/testing';
import { SiteService } from './site.service';
import { PrismaService } from '../common/services/prisma.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { UpdateSiteDto } from './dto';

describe('SiteService', () => {
  let siteService: SiteService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const mockPrismaService = {
      site: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SiteService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    siteService = module.get<SiteService>(SiteService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(siteService).toBeDefined();
    expect(prismaService).toBeDefined();
  });

  describe('getSite', () => {
    it('should return site configuration', async () => {
      const mockSite = {
        id: 'site-1',
        name: 'Test Site',
        domain: 'test.local',
        locale: 'zh',
        themeTokens: { primaryColor: '#1890ff' },
        settings: { siteName: 'Test Site' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prismaService.site.findUnique as jest.Mock).mockResolvedValue(mockSite);

      const result = await siteService.getSite();

      expect(prismaService.site.findUnique).toHaveBeenCalledWith({
        where: { id: 'site-1' },
      });
      expect(result).toEqual(mockSite);
    });

    it('should throw NotFoundException if site not found', async () => {
      (prismaService.site.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(siteService.getSite()).rejects.toThrow(NotFoundException);
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
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const updatedSite = {
        ...existingSite,
        name: 'Updated Site',
        updatedAt: new Date(),
      };

      (prismaService.site.findUnique as jest.Mock).mockResolvedValue(existingSite);
      (prismaService.site.update as jest.Mock).mockResolvedValue(updatedSite);

      const result = await siteService.updateSite(updateDto, user);

      expect(prismaService.site.update).toHaveBeenCalledWith({
        where: { id: existingSite.id },
        data: {
          ...updateDto,
          updatedAt: expect.any(Date),
        },
      });
      expect(result).toEqual(updatedSite);
    });

    it('should throw ForbiddenException for non-admin users', async () => {
      const user = { id: 'user-1', role: UserRole.VIEWER };
      const updateDto: UpdateSiteDto = { name: 'Unauthorized Update' };

      await expect(siteService.updateSite(updateDto, user)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should allow update for admin users', async () => {
      const user = { id: 'user-1', role: UserRole.ADMIN };
      const updateDto: UpdateSiteDto = { name: 'Admin Update' };
      const existingSite = {
        id: 'site-1',
        name: 'Test Site',
        domain: 'test.local',
        locale: 'zh',
        themeTokens: { primaryColor: '#1890ff' },
        settings: { siteName: 'Test Site' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prismaService.site.findUnique as jest.Mock).mockResolvedValue(existingSite);
      (prismaService.site.update as jest.Mock).mockResolvedValue({
        ...existingSite,
        ...updateDto,
        updatedAt: new Date(),
      });

      const result = await siteService.updateSite(updateDto, user);

      expect(result).toBeDefined();
      expect(prismaService.site.update).toHaveBeenCalled();
    });

    it('should allow update for owner users', async () => {
      const user = { id: 'user-1', role: UserRole.OWNER };
      const updateDto: UpdateSiteDto = { name: 'Owner Update' };
      const existingSite = {
        id: 'site-1',
        name: 'Test Site',
        domain: 'test.local',
        locale: 'zh',
        themeTokens: { primaryColor: '#1890ff' },
        settings: { siteName: 'Test Site' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prismaService.site.findUnique as jest.Mock).mockResolvedValue(existingSite);
      (prismaService.site.update as jest.Mock).mockResolvedValue({
        ...existingSite,
        ...updateDto,
        updatedAt: new Date(),
      });

      const result = await siteService.updateSite(updateDto, user);

      expect(result).toBeDefined();
      expect(prismaService.site.update).toHaveBeenCalled();
    });
  });

  describe('updateThemeTokens', () => {
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
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const updatedSite = {
        ...existingSite,
        themeTokens: themeDto.themeTokens,
        updatedAt: new Date(),
      };

      (prismaService.site.findUnique as jest.Mock).mockResolvedValue(existingSite);
      (prismaService.site.update as jest.Mock).mockResolvedValue(updatedSite);

      const result = await siteService.updateThemeTokens(themeDto, user);

      expect(prismaService.site.update).toHaveBeenCalledWith({
        where: { id: existingSite.id },
        data: {
          themeTokens: themeDto.themeTokens,
          updatedAt: expect.any(Date),
        },
      });
      expect(result).toEqual(updatedSite);
    });

    it('should throw ForbiddenException for non-admin users', async () => {
      const user = { id: 'user-1', role: UserRole.VIEWER };
      const themeDto = {
        themeTokens: { primaryColor: '#ff0000' },
      };

      await expect(siteService.updateThemeTokens(themeDto, user)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});