import { Test, TestingModule } from '@nestjs/testing';
import { PageService } from './page.service';
import { PrismaService } from '../common/services/prisma.service';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserRole, PageStatus, BlockType } from '@prisma/client';
import { CreatePageDto, UpdatePageDto, PageQueryDto } from './dto/page.dto';

describe('PageService', () => {
  let pageService: PageService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const mockPrismaService = {
      page: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      menuItem: {
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PageService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    pageService = module.get<PageService>(PageService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(pageService).toBeDefined();
    expect(prismaService).toBeDefined();
  });

  describe('create', () => {
    it('should create page successfully', async () => {
      const user = { id: 'user-1', role: UserRole.ADMIN };
      const createDto: CreatePageDto = {
        title: '关于我们',
        slug: 'about-us',
        description: '公司简介页面',
        status: PageStatus.DRAFT,
        isVisible: true,
        isHomePage: false,
        seoTitle: '关于我们 - 公司名称',
        seoDescription: '了解我们公司的详细信息',
        seoKeywords: '公司,简介,信息',
        blocks: [
          {
            type: BlockType.HERO,
            order: 0,
            isVisible: true,
            props: {
              title: '欢迎来到我们公司',
              subtitle: '专业技术服务',
              description: '我们致力于提供最优质的技术解决方案',
              backgroundImage: '/uploads/hero-bg.jpg',
              buttonText: '了解更多',
              buttonLink: '/services',
            },
          },
          {
            type: BlockType.TEXT,
            order: 1,
            isVisible: true,
            props: {
              content: '公司成立于2020年，拥有丰富的行业经验',
              style: { fontSize: '16px', color: '#333' },
            },
          },
        ],
      };

      const mockCreatedPage = {
        id: 'page-1',
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prismaService.page.create as jest.Mock).mockResolvedValue(mockCreatedPage);

      const result = await pageService.create(createDto, user);

      expect(prismaService.page.create).toHaveBeenCalledWith({
        data: createDto,
      });

      // Create page version
      expect(prismaService.page.create as jest.Mock).toHaveBeenCalledTimes(2);

      expect(result).toEqual(mockCreatedPage);
    });

    it('should throw ForbiddenException for unauthorized users', async () => {
      const user = { id: 'user-1', role: UserRole.VIEWER };
      const createDto: CreatePageDto = {
        title: '未授权页面',
        slug: 'unauthorized',
        status: PageStatus.DRAFT,
        blocks: [],
      };

      await expect(pageService.create(createDto, user)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should validate required fields', async () => {
      const user = { id: 'user-1', role: UserRole.ADMIN };
      const createDto = {
        title: '',
        slug: 'test',
        status: PageStatus.DRAFT,
        blocks: [],
      }; // Missing required title

      await expect(pageService.create(createDto, user)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should validate unique slug', async () => {
      const user = { id: 'user-1', role: UserRole.ADMIN };
      const createDto = {
        title: '测试页面',
        slug: 'about-us', // Duplicate slug
        status: PageStatus.DRAFT,
        blocks: [],
      };

      (prismaService.page.findFirst as jest.Mock).mockResolvedValue({
        slug: 'about-us',
      });

      await expect(pageService.create(createDto, user)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should create page version for block content', async () => {
      const user = { id: 'user-1', role: UserRole.ADMIN };
      const createDto: CreatePageDto = {
        title: '测试页面',
        slug: 'test-page',
        blocks: [{ type: BlockType.TEXT, order: 0, isVisible: true, props: { content: '测试内容' } }],
      };

      const mockCreatedPage = {
        id: 'page-1',
        title: createDto.title,
        slug: createDto.slug,
        status: PageStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prismaService.page.create as jest.Mock).mockResolvedValue(mockCreatedPage);

      const result = await pageService.create(createDto, user);

      expect(prismaService.page.create).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockCreatedPage);
    });
  });

  describe('findAll', () => {
    it('should return paginated pages with filters', async () => {
      const mockPages = [
        {
          id: 'page-1',
          title: '首页',
          slug: 'home',
          status: PageStatus.PUBLISHED,
          isVisible: true,
          isHomePage: true,
          createdAt: new Date(),
        },
        {
          id: 'page-2',
          title: '关于我们',
          slug: 'about',
          status: PageStatus.DRAFT,
          isVisible: true,
          isHomePage: false,
          createdAt: new Date(),
        },
      ];

      (prismaService.page.findMany as jest.Mock).mockResolvedValue(mockPages);

      const result = await pageService.findAll({});

      expect(prismaService.page.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });

      expect(result).toEqual({
        data: mockPages,
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should filter by status', async () => {
      const mockPages = [
        {
          id: 'page-1',
          title: '已发布页面',
          status: PageStatus.PUBLISHED,
        },
      ];

      (prismaService.page.findMany as jest.Mock).mockResolvedValue(mockPages);

      const result = await pageService.findAll({ status: PageStatus.PUBLISHED });

      expect(prismaService.page.findMany).toHaveBeenCalledWith({
        where: { status: PageStatus.PUBLISHED },
        orderBy: { createdAt: 'desc' },
      });

      expect(result).toEqual({
        data: mockPages,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should search pages by title', async () => {
      const mockPages = [
        {
          id: 'page-1',
          title: '搜索测试',
          slug: 'search-test',
        },
      ];

      (prismaService.page.findMany as jest.Mock).mockResolvedValue(mockPages);

      const result = await pageService.findAll({ search: '搜索' });

      expect(prismaService.page.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { title: { contains: '搜索', mode: 'insensitive' } },
            { slug: { contains: '搜索', mode: 'insensitive' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
      });

      expect(result).toEqual({
        data: mockPages,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should paginate results correctly', async () => {
      const mockPages = Array.from({ length: 25 }, (_, i) => ({
        id: `page-${i + 1}`,
        title: `页面 ${i + 1}`,
      }));

      (prismaService.page.findMany as jest.Mock).mockResolvedValue(mockPages);

      const result = await pageService.findAll({ page: 2, limit: 10 });

      expect(result).toEqual({
        data: mockPages.slice(10, 20),
        total: 25,
        page: 2,
        limit: 10,
        totalPages: 3,
      });
    });
  });

  describe('findOne', () => {
    it('should return page by id', async () => {
      const mockPage = {
        id: 'page-1',
        title: '关于我们',
        slug: 'about',
        status: PageStatus.PUBLISHED,
        blocks: [
          { type: BlockType.TEXT, order: 0, isVisible: true, props: { content: '公司介绍' } },
        ],
        versions: [
          { id: 'version-1', status: PageStatus.PUBLISHED, content: null, createdAt: new Date() },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prismaService.page.findUnique as jest.Mock).mockResolvedValue(mockPage);

      const result = await pageService.findOne('page-1');

      expect(prismaService.page.findUnique).toHaveBeenCalledWith({
        where: { id: 'page-1' },
        include: { versions: true },
      });

      expect(result).toEqual(mockPage);
    });

    it('should throw NotFoundException if page not found', async () => {
      (prismaService.page.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(pageService.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return page with menu item', async () => {
      const mockPage = {
        id: 'page-1',
        title: '菜单页面',
        menuItemId: 'menu-1',
      };

      (prismaService.page.findUnique as jest.Mock).mockResolvedValue(mockPage);

      const result = await pageService.findOne('page-1');

      expect(result).toEqual(mockPage);
    });
  });

  describe('update', () => {
    it('should update page successfully', async () => {
      const user = { id: 'user-1', role: UserRole.ADMIN };
      const updateDto: UpdatePageDto = {
        title: '关于我们（更新）',
        description: '更新后的公司简介',
        status: PageStatus.PUBLISHED,
      };

      const existingPage = {
        id: 'page-1',
        title: '关于我们',
        slug: 'about',
        status: PageStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedPage = {
        ...existingPage,
        ...updateDto,
        updatedAt: new Date(),
      };

      (prismaService.page.findUnique as jest.Mock).mockResolvedValue(existingPage);
      (prismaService.page.update as jest.Mock).mockResolvedValue(updatedPage);

      const result = await pageService.update('page-1', updateDto, user);

      expect(prismaService.page.update).toHaveBeenCalledWith({
        where: { id: 'page-1' },
        data: updateDto,
      });

      expect(result).toEqual(updatedPage);
    });

    it('should create new version when blocks are updated', async () => {
      const user = { id: 'user-1', role: UserRole.ADMIN };
      const updateDto: UpdatePageDto = {
        blocks: [
          { type: BlockType.TEXT, order: 0, isVisible: true, props: { content: '更新后的内容' } },
        ],
      };

      const existingPage = {
        id: 'page-1',
        title: '关于我们',
        blocks: [
          { type: BlockType.TEXT, order: 0, isVisible: true, props: { content: '原始内容' } },
        ],
        versions: [
          { id: 'version-1', status: PageStatus.PUBLISHED, content: null, createdAt: new Date() },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedPage = {
        ...existingPage,
        blocks: updateDto.blocks,
        updatedAt: new Date(),
      };

      (prismaService.page.findUnique as jest.Mock).mockResolvedValue(existingPage);
      (prismaService.page.update as jest.Mock).mockResolvedValue(updatedPage);

      const result = await pageService.update('page-1', updateDto, user);

      expect(prismaService.page.update).toHaveBeenCalledWith({
        where: { id: 'page-1' },
        data: updateDto,
      });

      expect(result).toEqual(updatedPage);
      expect(prismaService.pageVersion.create).toHaveBeenCalledWith({
        data: {
          pageId: 'page-1',
          status: PageStatus.PUBLISHED,
          content: JSON.stringify(updateDto.blocks),
        },
      });
    });

    it('should throw ForbiddenException for unauthorized users', async () => {
      const user = { id: 'user-1', role: UserRole.VIEWER };
      const updateDto: UpdatePageDto = { title: '未授权更新' };

      await expect(pageService.update('page-1', updateDto, user)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should validate title is not empty for published pages', async () => {
      const user = { id: 'user-1', role: UserRole.ADMIN };
      const updateDto = UpdatePageDto = {
        status: PageStatus.PUBLISHED,
        title: '', // Empty title
      };

      await expect(pageService.update('page-1', updateDto, user)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('remove', () => {
    it('should delete page successfully', async () => {
      const user = { id: 'user-1', role: UserRole.ADMIN };
      const existingPage = {
        id: 'page-1',
        title: '测试页面',
      };

      (prismaService.page.findUnique as jest.Mock).mockResolvedValue(existingPage);
      (prismaService.page.delete as jest.Mock).mockResolvedValue(existingPage);

      const result = await pageService.remove('page-1', user);

      expect(prismaService.page.delete).toHaveBeenCalledWith({
        where: { id: 'page-1' },
      });

      expect(result).toEqual(existingPage);
    });

    it('should throw ForbiddenException for unauthorized users', async () => {
      const user = { id: 'user-1', role: UserRole.VIEWER };

      await expect(pageService.remove('page-1', user)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should not allow deletion if page is linked to menu', async () => {
      const user = { id: 'user-1', role: UserRole.ADMIN };
      const existingPage = {
        id: 'page-1',
        title: '菜单页面',
        menuItemId: 'menu-1',
        menuItem: { id: 'menu-1', label: '菜单项' },
      };

      (prismaService.page.findUnique as jest.Mock).mockResolvedValue(existingPage);
      (prismaService.menuItem.findMany as jest.Mock).mockResolvedValue([
        { id: 'menu-1', label: '菜单项' },
      ]);

      await expect(pageService.remove('page-1', user)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getPageBySlug', () => {
    it('should return page by slug', async () => {
      const mockPage = {
        id: 'page-1',
        title: '关于我们',
        slug: 'about-us',
      };

      (prismaService.page.findUnique as jest.Mock).mockResolvedValue(mockPage);

      const result = await pageService.getPageBySlug('about-us');

      expect(prismaService.page.findUnique).toHaveBeenCalledWith({
        where: { slug: 'about-us' },
      });

      expect(result).toEqual(mockPage);
    });

    it('should throw NotFoundException if page not found by slug', async () => {
      (prismaService.page.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(pageService.getPageBySlug('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('publish', () => {
    it('should publish page successfully', async () => {
      const user = { id: 'user-1', role: UserRole.ADMIN };
      const existingPage = {
        id: 'page-1',
        title: '草稿页面',
        status: PageStatus.DRAFT,
        versions: [
          { id: 'version-1', status: PageStatus.DRAFT, content: null, createdAt: new Date() },
        ],
      };

      const publishedPage = {
        ...existingPage,
        status: PageStatus.PUBLISHED,
      };

      (prismaService.page.findUnique as jest.Mock).mockResolvedValue(existingPage);
      (prismaService.page.update as jest.Mock).mockResolvedValue(publishedPage);

      const result = await pageService.publish('page-1', user);

      expect(prismaService.page.update).toHaveBeenCalledWith({
        where: { id: 'page-1' },
        data: { status: PageStatus.PUBLISHED },
      });

      expect(prismaService.pageVersion.create).toHaveBeenCalledWith({
        data: {
          pageId: 'page-1',
          status: PageStatus.PUBLISHED,
          content: null,
        },
      });
    });

    it('should throw ForbiddenException for unauthorized users', async () => {
      const user = { id: 'user-1', role: UserRole.VIEWER };

      await expect(pageService.publish('page-1', user)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});