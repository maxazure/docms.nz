import { Test, TestingModule } from '@nestjs/testing';
import { TagService } from './tag.service';
import { PrismaService } from '../common/services/prisma.service';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { UserRole } from '@prisma/client';

describe('TagService', () => {
  let service: TagService;
  let prisma: PrismaService;

  const mockPrismaService = {
    tag: {
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
        TagService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TagService>(TagService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      name: '水培技术',
      slug: 'hydroponics-tech',
    };

    it('should create a tag successfully', async () => {
      const mockTag = {
        id: 'tag-1',
        ...createDto,
        createdAt: new Date(),
      };

      mockPrismaService.tag.findUnique.mockResolvedValue(null);
      mockPrismaService.tag.create.mockResolvedValue(mockTag);

      const result = await service.create(createDto, mockAdmin);

      expect(result).toEqual(mockTag);
      expect(mockPrismaService.tag.findUnique).toHaveBeenCalledWith({
        where: { slug: createDto.slug },
      });
      expect(mockPrismaService.tag.create).toHaveBeenCalledWith({
        data: createDto,
      });
    });

    it('should throw BadRequestException if slug already exists', async () => {
      mockPrismaService.tag.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(service.create(createDto, mockAdmin)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(createDto, mockAdmin)).rejects.toThrow(
        '标签URL路径已存在',
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
  });

  describe('findAll', () => {
    it('should return all tags', async () => {
      const mockTags = [
        { id: 'tag-1', name: 'Tag 1', slug: 'tag-1' },
        { id: 'tag-2', name: 'Tag 2', slug: 'tag-2' },
      ];

      mockPrismaService.tag.findMany.mockResolvedValue(mockTags);

      const result = await service.findAll();

      expect(result).toEqual(mockTags);
      expect(mockPrismaService.tag.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { name: 'asc' },
      });
    });

    it('should search tags by name', async () => {
      const mockTags = [
        { id: 'tag-1', name: 'Hydroponics', slug: 'hydroponics' },
      ];

      mockPrismaService.tag.findMany.mockResolvedValue(mockTags);

      await service.findAll({ search: 'hydro' });

      expect(mockPrismaService.tag.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'hydro', mode: 'insensitive' } },
            { slug: { contains: 'hydro', mode: 'insensitive' } },
          ],
        },
        orderBy: { name: 'asc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a tag by id', async () => {
      const mockTag = {
        id: 'tag-1',
        name: 'Tag 1',
        slug: 'tag-1',
      };

      mockPrismaService.tag.findUnique.mockResolvedValue(mockTag);

      const result = await service.findOne('tag-1');

      expect(result).toEqual(mockTag);
      expect(mockPrismaService.tag.findUnique).toHaveBeenCalledWith({
        where: { id: 'tag-1' },
      });
    });

    it('should throw NotFoundException if tag not found', async () => {
      mockPrismaService.tag.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('non-existent')).rejects.toThrow(
        '标签不存在',
      );
    });
  });

  describe('update', () => {
    const updateDto = {
      name: 'Updated Tag',
    };

    it('should update a tag successfully', async () => {
      const existingTag = {
        id: 'tag-1',
        name: 'Original',
        slug: 'original',
      };

      const updatedTag = {
        ...existingTag,
        ...updateDto,
      };

      mockPrismaService.tag.findUnique.mockResolvedValue(existingTag);
      mockPrismaService.tag.update.mockResolvedValue(updatedTag);

      const result = await service.update('tag-1', updateDto, mockAdmin);

      expect(result).toEqual(updatedTag);
      expect(mockPrismaService.tag.update).toHaveBeenCalledWith({
        where: { id: 'tag-1' },
        data: updateDto,
      });
    });

    it('should throw ForbiddenException if user does not have permission', async () => {
      await expect(service.update('tag-1', updateDto, mockViewer)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException if tag not found', async () => {
      mockPrismaService.tag.findUnique.mockResolvedValue(null);

      await expect(service.update('non-existent', updateDto, mockAdmin)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should check slug uniqueness when updating', async () => {
      const existingTag = { id: 'tag-1', name: 'Tag 1', slug: 'tag-1' };
      const updateWithSlug = { slug: 'new-slug' };

      mockPrismaService.tag.findUnique
        .mockResolvedValueOnce(existingTag) // for existence check
        .mockResolvedValueOnce(null); // for slug uniqueness check

      mockPrismaService.tag.update.mockResolvedValue({
        ...existingTag,
        ...updateWithSlug,
      });

      await service.update('tag-1', updateWithSlug, mockAdmin);

      expect(mockPrismaService.tag.findUnique).toHaveBeenCalledTimes(2);
    });
  });

  describe('remove', () => {
    it('should delete a tag successfully', async () => {
      const mockTag = {
        id: 'tag-1',
        name: 'Tag 1',
      };

      mockPrismaService.tag.findUnique.mockResolvedValue(mockTag);
      mockPrismaService.tag.delete.mockResolvedValue(mockTag);

      const result = await service.remove('tag-1', mockAdmin);

      expect(result).toEqual(mockTag);
      expect(mockPrismaService.tag.delete).toHaveBeenCalledWith({
        where: { id: 'tag-1' },
      });
    });

    it('should throw ForbiddenException if user does not have permission', async () => {
      await expect(service.remove('tag-1', mockViewer)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException if tag not found', async () => {
      mockPrismaService.tag.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent', mockAdmin)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
