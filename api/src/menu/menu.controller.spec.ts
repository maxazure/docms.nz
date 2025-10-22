import { Test, TestingModule } from '@nestjs/testing';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CreateMenuItemDto, UpdateMenuItemDto, MenuItemType } from './dto/menu.dto';

describe('MenuController', () => {
  let menuController: MenuController;
  let menuService: MenuService;

  beforeEach(async () => {
    const mockMenuService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      buildTree: jest.fn(),
      reorder: jest.fn(),
      toggleVisibility: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MenuController],
      providers: [
        {
          provide: MenuService,
          useValue: mockMenuService,
        },
      ],
    }).compile();

    menuController = module.get<MenuController>(MenuController);
    menuService = module.get<MenuService>(MenuService);
  });

  it('should be defined', () => {
    expect(menuController).toBeDefined();
    expect(menuService).toBeDefined();
  });

  describe('create', () => {
    it('should create menu item successfully', async () => {
      const user = { id: 'user-1', role: UserRole.ADMIN };
      const createDto: CreateMenuItemDto = {
        title: '关于我们',
        type: MenuItemType.PAGE,
        pageId: 'page-1',
      };

      const mockCreatedMenu = { id: 'menu-1' };

      (menuService.create as jest.Mock).mockResolvedValue(mockCreatedMenu);

      const result = await menuController.create(createDto, user);

      expect(menuService.create).toHaveBeenCalledWith(createDto, user);
      expect(result).toEqual({
        success: true,
        message: '菜单项创建成功',
        data: mockCreatedMenu,
      });
    });

    it('should handle ForbiddenException from service', async () => {
      const user = { id: 'user-1', role: UserRole.VIEWER };
      const createDto: CreateMenuItemDto = {
        title: '未授权菜单',
        type: MenuItemType.PAGE,
      };

      (menuService.create as jest.Mock).mockRejectedValue(
        new ForbiddenException('权限不足')
      );

      const result = await menuController.create(createDto, user);

      expect(result).toEqual({
        success: false,
        message: '权限不足',
        data: null,
      });
    });
  });

  describe('findAll', () => {
    it('should return all menu items', async () => {
      const mockMenuItems = [
        { id: 'menu-1', label: '首页' },
        { id: 'menu-2', label: '关于我们' },
      ];

      (menuService.findAll as jest.Mock).mockResolvedValue(mockMenuItems);

      const result = await menuController.findAll({});

      expect(menuService.findAll).toHaveBeenCalledWith({});
      expect(result).toEqual({
        success: true,
        data: mockMenuItems,
      });
    });

    it('should return visible menu items only', async () => {
      const mockMenuItems = [
        { id: 'menu-1', label: '首页', isVisible: true },
      ];

      (menuService.findAll as jest.Mock).mockResolvedValue(mockMenuItems);

      const result = await menuController.findAll({ visibleOnly: true });

      expect(menuService.findAll).toHaveBeenCalledWith({ visibleOnly: true });
      expect(result).toEqual({
        success: true,
        data: mockMenuItems,
      });
    });
  });

  describe('findOne', () => {
    it('should return menu item by id', async () => {
      const mockMenuItem = { id: 'menu-1', label: '关于我们' };

      (menuService.findOne as jest.Mock).mockResolvedValue(mockMenuItem);

      const result = await menuController.findOne('menu-1');

      expect(menuService.findOne).toHaveBeenCalledWith('menu-1');
      expect(result).toEqual({
        success: true,
        data: mockMenuItem,
      });
    });

    it('should handle NotFoundException from service', async () => {
      (menuService.findOne as jest.Mock).mockRejectedValue(
        new NotFoundException('菜单项未找到')
      );

      const result = await menuController.findOne('non-existent');

      expect(result).toEqual({
        success: false,
        message: '菜单项未找到',
        data: null,
      });
    });
  });

  describe('update', () => {
    it('should update menu item successfully', async () => {
      const user = { id: 'user-1', role: UserRole.ADMIN };
      const updateDto: UpdateMenuItemDto = {
        title: '关于我们（更新）',
      };

      const mockUpdatedMenu = { id: 'menu-1', label: '关于我们（更新）' };

      (menuService.update as jest.Mock).mockResolvedValue(mockUpdatedMenu);

      const result = await menuController.update('menu-1', updateDto, user);

      expect(menuService.update).toHaveBeenCalledWith('menu-1', updateDto, user);
      expect(result).toEqual({
        success: true,
        message: '菜单项更新成功',
        data: mockUpdatedMenu,
      });
    });

    it('should handle ForbiddenException from service', async () => {
      const user = { id: 'user-1', role: UserRole.VIEWER };
      const updateDto: UpdateMenuItemDto = { title: '未授权更新' };

      (menuService.update as jest.Mock).mockRejectedValue(
        new ForbiddenException('权限不足')
      );

      const result = await menuController.update('menu-1', updateDto, user);

      expect(result).toEqual({
        success: false,
        message: '权限不足',
        data: null,
      });
    });
  });

  describe('remove', () => {
    it('should delete menu item successfully', async () => {
      const user = { id: 'user-1', role: UserRole.ADMIN };

      const mockDeletedMenu = { id: 'menu-1', label: '已删除菜单' };

      (menuService.remove as jest.Mock).mockResolvedValue(mockDeletedMenu);

      const result = await menuController.remove('menu-1', user);

      expect(menuService.remove).toHaveBeenCalledWith('menu-1', user);
      expect(result).toEqual({
        success: true,
        message: '菜单项删除成功',
        data: mockDeletedMenu,
      });
    });

    it('should handle ForbiddenException from service', async () => {
      const user = { id: 'user-1', role: UserRole.VIEWER };

      (menuService.remove as jest.Mock).mockRejectedValue(
        new ForbiddenException('权限不足')
      );

      const result = await menuController.remove('menu-1', user);

      expect(result).toEqual({
        success: false,
        message: '权限不足',
        data: null,
      });
    });
  });

  describe('getMenuTree', () => {
    it('should return hierarchical menu tree', async () => {
      const mockMenuTree = [
        {
          id: 'menu-1',
          label: '首页',
          children: [
            { id: 'menu-2', label: '关于我们' },
          ],
        },
        {
          id: 'menu-3',
          label: '新闻动态',
          children: [],
        },
      ];

      (menuService.getMenuTree as jest.Mock).mockResolvedValue(mockMenuTree);

      const result = await menuController.getMenuTree({});

      expect(menuService.getMenuTree).toHaveBeenCalledWith({});
      expect(result).toEqual({
        success: true,
        data: mockMenuTree,
      });
    });
  });
});