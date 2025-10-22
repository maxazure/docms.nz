import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { PrismaService } from '../common/services/prisma.service';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { UserRole } from '@prisma/client';

describe('ProductService', () => {
  let service: ProductService;
  let prisma: PrismaService;

  const mockPrismaService = {
    product: {
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
        ProductService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      name: '智能水培系统 Pro',
      slug: 'smart-hydroponic-pro',
      summary: '专业级智能水培种植系统',
      specs: {
        size: '120x60x180cm',
        capacity: '48 plants',
        power: '200W',
      },
      price: 2999.00,
      categoryId: 'cat-1',
      tagIds: ['tag-1', 'tag-2'],
    };

    it('should create a product successfully', async () => {
      const mockProduct = {
        id: 'product-1',
        name: createDto.name,
        slug: createDto.slug,
        summary: createDto.summary,
        specs: createDto.specs,
        price: createDto.price,
        categoryId: createDto.categoryId,
        tags: createDto.tagIds,
        isActive: true,
        isFeatured: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.product.findUnique.mockResolvedValue(null);
      mockPrismaService.product.create.mockResolvedValue(mockProduct);

      const result = await service.create(createDto, mockEditor);

      expect(result).toEqual(mockProduct);
      expect(mockPrismaService.product.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: createDto.name,
          slug: createDto.slug,
          categoryId: createDto.categoryId,
          tags: createDto.tagIds,
        }),
      });
    });

    it('should throw BadRequestException if slug already exists', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(service.create(createDto, mockEditor)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(createDto, mockEditor)).rejects.toThrow(
        '产品URL路径已存在',
      );
    });

    it('should throw ForbiddenException if user does not have permission', async () => {
      await expect(service.create(createDto, mockViewer)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      const mockProducts = [
        { id: 'product-1', name: 'Product 1', isActive: true },
        { id: 'product-2', name: 'Product 2', isActive: true },
      ];

      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);
      mockPrismaService.product.count.mockResolvedValue(2);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toEqual(mockProducts);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should filter by isActive', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([]);
      mockPrismaService.product.count.mockResolvedValue(0);

      await service.findAll({ isActive: true });

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
          }),
        }),
      );
    });

    it('should search by name and summary', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([]);
      mockPrismaService.product.count.mockResolvedValue(0);

      await service.findAll({ search: '水培' });

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { name: { contains: '水培', mode: 'insensitive' } },
              { summary: { contains: '水培', mode: 'insensitive' } },
            ]),
          }),
        }),
      );
    });

    it('should filter by price range', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([]);
      mockPrismaService.product.count.mockResolvedValue(0);

      await service.findAll({ minPrice: 1000, maxPrice: 5000 });

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            price: {
              gte: 1000,
              lte: 5000,
            },
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      const mockProduct = {
        id: 'product-1',
        name: 'Product 1',
        category: null,
      };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      const result = await service.findOne('product-1');

      expect(result).toEqual(mockProduct);
      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: 'product-1' },
        include: expect.objectContaining({
          category: true,
        }),
      });
    });

    it('should throw NotFoundException if product not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateDto = {
      name: 'Updated Product',
      categoryId: 'cat-3',
      tagIds: ['tag-3'],
    };

    it('should update a product successfully', async () => {
      const existingProduct = {
        id: 'product-1',
        name: 'Original',
        slug: 'original',
      };

      const updatedProduct = {
        ...existingProduct,
        ...updateDto,
      };

      mockPrismaService.product.findUnique.mockResolvedValue(existingProduct);
      mockPrismaService.product.update.mockResolvedValue(updatedProduct);

      const result = await service.update('product-1', updateDto, mockAdmin);

      expect(mockPrismaService.product.update).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user does not have permission', async () => {
      await expect(service.update('product-1', updateDto, mockViewer)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException if product not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.update('non-existent', updateDto, mockAdmin)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a product successfully', async () => {
      const mockProduct = {
        id: 'product-1',
        name: 'Product 1',
      };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.product.delete.mockResolvedValue(mockProduct);

      const result = await service.remove('product-1', mockAdmin);

      expect(result).toEqual(mockProduct);
    });

    it('should throw ForbiddenException if user does not have permission', async () => {
      await expect(service.remove('product-1', mockViewer)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException if product not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent', mockAdmin)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('toggleActive', () => {
    it('should toggle product active status', async () => {
      const activeProduct = {
        id: 'product-1',
        isActive: true,
      };

      const inactiveProduct = {
        ...activeProduct,
        isActive: false,
      };

      mockPrismaService.product.findUnique.mockResolvedValue(activeProduct);
      mockPrismaService.product.update.mockResolvedValue(inactiveProduct);

      const result = await service.toggleActive('product-1', mockAdmin);

      expect(result.isActive).toBe(false);
      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: 'product-1' },
        data: { isActive: false },
      });
    });

    it('should throw NotFoundException if product not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.toggleActive('non-existent', mockAdmin)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should only allow admin to toggle active status', async () => {
      const activeProduct = {
        id: 'product-1',
        isActive: true,
      };

      mockPrismaService.product.findUnique.mockResolvedValue(activeProduct);

      await expect(service.toggleActive('product-1', mockEditor)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
