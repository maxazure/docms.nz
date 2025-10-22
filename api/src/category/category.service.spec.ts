import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { PrismaService } from '../common/services/prisma.service';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { UserRole } from '@prisma/client';

describe('CategoryService', () => {
  let service: CategoryService;
  let prisma: PrismaService;

  const mockPrismaService = {
    category: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockAdmin = {
    id: 'admin-id',
    role: UserRole.ADMIN,
    email: 'admin@test.com',
  };

  const mockEditor = {
    id: 'editor-id',
    role: UserRole.EDITOR,
    email: 'editor@test.com',
  };

  const mockViewer = {
    id: 'viewer-id',
    role: UserRole.VIEWER,
    email: 'viewer@test.com',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    prisma = module.get<PrismaService>(PrismaService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      name: '家庭水培设备',
      slug: 'home-hydroponics',
      parentId: null,
      order: 1,
    };

    it('should create a category successfully', async () => {
      const mockCategory = {
        id: 'cat-1',
        ...createDto,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.category.findUnique.mockResolvedValue(null);
      mockPrismaService.category.create.mockResolvedValue(mockCategory);

      const result = await service.create(createDto, mockAdmin);

      expect(result).toEqual(mockCategory);
      expect(mockPrismaService.category.findUnique).toHaveBeenCalledWith({
        where: { slug: createDto.slug },
      });
      expect(mockPrismaService.category.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: createDto.name,
          slug: createDto.slug,
          parentId: createDto.parentId,
          order: createDto.order,
          isActive: true,
        }),
      });
    });

    it('should throw BadRequestException if slug already exists', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(service.create(createDto, mockAdmin)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(createDto, mockAdmin)).rejects.toThrow(
        '分类URL路径已存在',
      );
    });

    it('should throw ForbiddenException if user does not have permission', async () => {
      await expect(service.create(createDto, mockViewer)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.create(createDto, mockViewer)).rejects.toThrow(
        '权限不足',
      );
    });

    it('should verify parent category exists if parentId is provided', async () => {
      const dtoWithParent = { ...createDto, parentId: 'parent-id' };

      mockPrismaService.category.findUnique
        .mockResolvedValueOnce(null) // for slug check
        .mockResolvedValueOnce({ id: 'parent-id', name: 'Parent' }); // for parent check

      mockPrismaService.category.create.mockResolvedValue({
        id: 'cat-2',
        ...dtoWithParent,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await service.create(dtoWithParent, mockAdmin);

      expect(mockPrismaService.category.findUnique).toHaveBeenCalledTimes(2);
    });

    it('should throw NotFoundException if parent category does not exist', async () => {
      const dtoWithParent = { ...createDto, slug: 'unique-slug', parentId: 'non-existent' };

      mockPrismaService.category.findUnique
        .mockResolvedValueOnce(null) // for slug check
        .mockResolvedValueOnce(null); // for parent check (not found)

      await expect(service.create(dtoWithParent, mockAdmin)).rejects.toThrow(
        '父分类不存在',
      );
    });
  });

  describe('findAll', () => {
    it('should return all categories', async () => {
      const mockCategories = [
        { id: 'cat-1', name: 'Category 1', slug: 'cat-1', isActive: true },
        { id: 'cat-2', name: 'Category 2', slug: 'cat-2', isActive: true },
      ];

      mockPrismaService.category.findMany.mockResolvedValue(mockCategories);

      const result = await service.findAll();

      expect(result).toEqual(mockCategories);
      expect(mockPrismaService.category.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { order: 'asc' },
      });
    });

    it('should include inactive categories if specified', async () => {
      const mockCategories = [
        { id: 'cat-1', name: 'Category 1', isActive: true },
        { id: 'cat-2', name: 'Category 2', isActive: false },
      ];

      mockPrismaService.category.findMany.mockResolvedValue(mockCategories);

      await service.findAll({ includeInactive: true });

      expect(mockPrismaService.category.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { order: 'asc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a category by id', async () => {
      const mockCategory = {
        id: 'cat-1',
        name: 'Category 1',
        slug: 'cat-1',
        isActive: true,
      };

      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);

      const result = await service.findOne('cat-1');

      expect(result).toEqual(mockCategory);
      expect(mockPrismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: 'cat-1' },
        include: {
          parent: true,
          children: {
            where: { isActive: true },
            orderBy: { order: 'asc' },
          },
        },
      });
    });

    it('should throw NotFoundException if category not found', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('non-existent')).rejects.toThrow(
        '分类不存在',
      );
    });
  });

  describe('getTree', () => {
    it('should return hierarchical category tree', async () => {
      const mockCategories = [
        { id: 'cat-1', name: 'Parent 1', parentId: null, order: 1 },
        { id: 'cat-2', name: 'Child 1-1', parentId: 'cat-1', order: 1 },
        { id: 'cat-3', name: 'Child 1-2', parentId: 'cat-1', order: 2 },
        { id: 'cat-4', name: 'Parent 2', parentId: null, order: 2 },
      ];

      mockPrismaService.category.findMany.mockResolvedValue(mockCategories);

      const result = await service.getTree();

      expect(result).toHaveLength(2); // Two root categories
      expect(result[0].children).toHaveLength(2); // Parent 1 has 2 children
    });
  });

  describe('update', () => {
    const updateDto = {
      name: 'Updated Category',
      order: 5,
    };

    it('should update a category successfully', async () => {
      const existingCategory = {
        id: 'cat-1',
        name: 'Original',
        slug: 'original',
        isActive: true,
      };

      const updatedCategory = {
        ...existingCategory,
        ...updateDto,
      };

      mockPrismaService.category.findUnique.mockResolvedValue(existingCategory);
      mockPrismaService.category.update.mockResolvedValue(updatedCategory);

      const result = await service.update('cat-1', updateDto, mockAdmin);

      expect(result).toEqual(updatedCategory);
      expect(mockPrismaService.category.update).toHaveBeenCalledWith({
        where: { id: 'cat-1' },
        data: updateDto,
      });
    });

    it('should throw ForbiddenException if user does not have permission', async () => {
      await expect(service.update('cat-1', updateDto, mockViewer)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException if category not found', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(service.update('non-existent', updateDto, mockAdmin)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should prevent circular parent reference', async () => {
      const category = { id: 'cat-1', name: 'Category 1' };

      mockPrismaService.category.findUnique.mockResolvedValue(category);

      await expect(
        service.update('cat-1', { parentId: 'cat-1' }, mockAdmin),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.update('cat-1', { parentId: 'cat-1' }, mockAdmin),
      ).rejects.toThrow('不能将分类设置为自己的父分类');
    });
  });

  describe('remove', () => {
    it('should delete a category successfully', async () => {
      const mockCategory = {
        id: 'cat-1',
        name: 'Category 1',
        children: [],
      };

      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.category.delete.mockResolvedValue(mockCategory);

      const result = await service.remove('cat-1', mockAdmin);

      expect(result).toEqual(mockCategory);
      expect(mockPrismaService.category.delete).toHaveBeenCalledWith({
        where: { id: 'cat-1' },
      });
    });

    it('should throw BadRequestException if category has children', async () => {
      const mockCategory = {
        id: 'cat-1',
        name: 'Category 1',
        children: [{ id: 'child-1' }],
      };

      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);

      await expect(service.remove('cat-1', mockAdmin)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.remove('cat-1', mockAdmin)).rejects.toThrow(
        '该分类下有子分类，无法删除',
      );
    });

    it('should throw ForbiddenException if user does not have permission', async () => {
      await expect(service.remove('cat-1', mockViewer)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('toggleActive', () => {
    it('should toggle category active status', async () => {
      const mockCategory = { id: 'cat-1', isActive: true };
      const toggledCategory = { ...mockCategory, isActive: false };

      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.category.update.mockResolvedValue(toggledCategory);

      const result = await service.toggleActive('cat-1', mockAdmin);

      expect(result).toEqual(toggledCategory);
      expect(mockPrismaService.category.update).toHaveBeenCalledWith({
        where: { id: 'cat-1' },
        data: { isActive: false },
      });
    });
  });
});
