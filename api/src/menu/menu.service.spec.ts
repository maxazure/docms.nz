import { Test, TestingModule } from '@nestjs/testing';
import { MenuService } from './menu.service';
import { PrismaService } from '../common/services/prisma.service';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserRole, LinkType } from '@prisma/client';
import { CreateMenuItemDto, UpdateMenuItemDto, MenuItemType } from './dto/menu.dto';

describe('MenuService', () => {
  let menuService: MenuService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const mockPrismaService = {
      menuItem: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    menuService = module.get<MenuService>(MenuService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(menuService).toBeDefined();
    expect(prismaService).toBeDefined();
  });

  describe('create', () => {
    it('should create menu item successfully', async () => {
      const user = { id: 'user-1', role: UserRole.ADMIN };
      const createDto: CreateMenuItemDto = {
        title: '关于我们',
        type: MenuItemType.PAGE,
        pageId: 'page-1',
        order: 1,
        isVisible: true,
        isActive: true,
      };

      const mockCreatedMenu = {
        id: 'menu-1',
        menuCode: 'about_us',
        label: createDto.title,
        slug: 'about-us',
        type: MenuItemType.PAGE,
        linkTarget: createDto.pageId,
        linkType: LinkType.INTERNAL,
        order: createDto.order,
        isVisible: createDto.isVisible,
        isActive: createDto.isActive,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prismaService.menuItem.create as jest.Mock).mockResolvedValue(mockCreatedMenu);

      const result = await menuService.create(createDto, user);

      expect(prismaService.menuItem.create).toHaveBeenCalled();
      expect(result).toEqual(mockCreatedMenu);
    });

    it('should throw ForbiddenException for unauthorized users', async () => {
      const user = { id: 'user-1', role: UserRole.VIEWER };
      const createDto: CreateMenuItemDto = {
        title: '未授权菜单',
        type: MenuItemType.PAGE,
      };

      await expect(menuService.create(createDto, user)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should allow ADMIN, EDITOR, AUTHOR to create menus', async () => {
      const admin = { id: 'admin-1', role: UserRole.ADMIN };
      const editor = { id: 'editor-1', role: UserRole.EDITOR };
      const author = { id: 'author-1', role: UserRole.AUTHOR };

      const createDto: CreateMenuItemDto = {
        title: '测试菜单',
        type: MenuItemType.PAGE,
        pageId: 'page-1',
      };

      (prismaService.menuItem.create as jest.Mock).mockResolvedValue({ id: 'menu-1' });

      // Test admin
      await expect(menuService.create(createDto, admin)).resolves.toBeDefined();
      // Test editor
      await expect(menuService.create(createDto, editor)).resolves.toBeDefined();
      // Test author
      await expect(menuService.create(createDto, author)).resolves.toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return all menu items', async () => {
      const mockMenuItems = [
        {
          id: 'menu-1',
          menuCode: 'home',
          label: '首页',
          slug: 'home',
          type: MenuItemType.PAGE,
          order: 0,
          isVisible: true,
          isActive: true,
        },
      ];

      (prismaService.menuItem.findMany as jest.Mock).mockResolvedValue(mockMenuItems);

      const result = await menuService.findAll();

      expect(prismaService.menuItem.findMany).toHaveBeenCalledWith({
        orderBy: [
          { order: 'asc' },
          { createdAt: 'desc' },
        ],
      });
      expect(result).toEqual(mockMenuItems);
    });

    it('should filter visible menu items only', async () => {
      const mockFilteredMenuItems = [
        {
          id: 'menu-1',
          menuCode: 'home',
          label: '首页',
          slug: 'home',
          type: MenuItemType.PAGE,
          order: 0,
          isVisible: true,
          isActive: true,
        },
      ];

      (prismaService.menuItem.findMany as jest.Mock).mockResolvedValue(mockFilteredMenuItems);

      const result = await menuService.findAll({ visibleOnly: true });

      expect(prismaService.menuItem.findMany).toHaveBeenCalledWith({
        where: { isVisible: true, isActive: true },
        orderBy: [
          { order: 'asc' },
          { createdAt: 'desc' },
        ],
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return menu item by id', async () => {
      const mockMenuItem = {
        id: 'menu-1',
        menuCode: 'about',
        label: '关于我们',
        slug: 'about-us',
        type: MenuItemType.PAGE,
        order: 1,
        isVisible: true,
        isActive: true,
      };

      (prismaService.menuItem.findUnique as jest.Mock).mockResolvedValue(mockMenuItem);

      const result = await menuService.findOne('menu-1');

      expect(prismaService.menuItem.findUnique).toHaveBeenCalledWith({
        where: { id: 'menu-1' },
      });
      expect(result).toEqual(mockMenuItem);
    });

    it('should throw NotFoundException if menu item not found', async () => {
      (prismaService.menuItem.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(menuService.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update menu item successfully', async () => {
      const user = { id: 'user-1', role: UserRole.ADMIN };
      const updateDto: UpdateMenuItemDto = {
        title: '关于我们（更新）',
        order: 2,
        isVisible: false,
      };

      const existingMenuItem = {
        id: 'menu-1',
        menuCode: 'about',
        label: '关于我们',
        slug: 'about',
        type: MenuItemType.PAGE,
        order: 1,
        isVisible: true,
        isActive: true,
      };

      const updatedMenuItem = {
        ...existingMenuItem,
        ...updateDto,
        updatedAt: new Date(),
      };

      (prismaService.menuItem.findUnique as jest.Mock).mockResolvedValue(existingMenuItem);
      (prismaService.menuItem.update as jest.Mock).mockResolvedValue(updatedMenuItem);

      const result = await menuService.update('menu-1', updateDto, user);

      expect(prismaService.menuItem.update).toHaveBeenCalledWith({
        where: { id: 'menu-1' },
        data: updateDto,
      });
      expect(result).toEqual(updatedMenuItem);
    });

    it('should throw ForbiddenException for unauthorized users', async () => {
      const user = { id: 'user-1', role: UserRole.VIEWER };
      const updateDto: UpdateMenuItemDto = { title: '未授权更新' };

      await expect(menuService.update('menu-1', updateDto, user)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('remove', () => {
    it('should delete menu item successfully', async () => {
      const user = { id: 'user-1', role: UserRole.ADMIN };
      const existingMenuItem = {
        id: 'menu-1',
        menuCode: 'test',
        label: '测试菜单',
        type: MenuItemType.PAGE,
        order: 1,
        isVisible: true,
        isActive: true,
      };

      (prismaService.menuItem.findUnique as jest.Mock).mockResolvedValue(existingMenuItem);
      (prismaService.menuItem.delete as jest.Mock).mockResolvedValue(existingMenuItem);

      const result = await menuService.remove('menu-1', user);

      expect(prismaService.menuItem.delete).toHaveBeenCalledWith({
        where: { id: 'menu-1' },
      });
      expect(result).toEqual(existingMenuItem);
    });

    it('should throw ForbiddenException for unauthorized users', async () => {
      const user = { id: 'user-1', role: UserRole.VIEWER };

      await expect(menuService.remove('menu-1', user)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should not allow deletion if menu has children', async () => {
      const user = { id: 'user-1', role: UserRole.ADMIN };
      const existingMenuItem = {
        id: 'menu-1',
        menuCode: 'parent',
        label: '父级菜单',
        type: MenuItemType.PAGE,
      };

      (prismaService.menuItem.findUnique as jest.Mock).mockResolvedValue(existingMenuItem);
      (prismaService.menuItem.count as jest.Mock).mockResolvedValue(2); // Has 2 children

      await expect(menuService.remove('menu-1', user)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('buildTree', () => {
    it('should build hierarchical menu tree structure', async () => {
      const flatMenuItems = [
        {
          id: 'menu-1',
          menuCode: 'home',
          label: '首页',
          slug: 'home',
          type: MenuItemType.PAGE,
          order: 0,
          isVisible: true,
          isActive: true,
        },
        {
          id: 'menu-2',
          menuCode: 'about',
          label: '关于我们',
          parentId: 'menu-1',
          slug: 'about',
          type: MenuItemType.PAGE,
          order: 1,
          isVisible: true,
          isActive: true,
        },
        {
          id: 'menu-3',
          menuCode: 'news',
          label: '新闻动态',
          slug: 'news',
          type: MenuItemType.POST_LIST,
          order: 2,
          isVisible: true,
          isActive: true,
        },
      ];

      const treeResult = await menuService.buildTree(flatMenuItems);

      expect(treeResult).toHaveLength(2); // 2 root items
      expect(treeResult[0].children).toHaveLength(1); // Home has 1 child
      expect(treeResult[0].children![0].label).toBe('关于我们');
      expect(treeResult[1].label).toBe('新闻动态');
      expect(treeResult[1].children).toBeUndefined(); // News has no children
    });
  });
});