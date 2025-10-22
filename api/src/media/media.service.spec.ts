import { Test, TestingModule } from '@nestjs/testing';
import { MediaService } from './media.service';
import { PrismaService } from '../common/services/prisma.service';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CreateMediaDto, UpdateMediaDto, MediaType } from './dto/media.dto';

describe('MediaService', () => {
  let mediaService: MediaService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const mockPrismaService = {
      media: {
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
        MediaService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    mediaService = module.get<MediaService>(MediaService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(mediaService).toBeDefined();
    expect(prismaService).toBeDefined();
  });

  describe('createMedia', () => {
    it('should create media successfully', async () => {
      const user = { id: 'user-1', role: UserRole.ADMIN };
      const createDto: CreateMediaDto = {
        filename: 'test-image.png',
        type: MediaType.IMAGE,
        mimeType: 'image/png',
        size: 12345,
        path: '/uploads/2024/01/test-image.png',
        url: 'https://example.com/uploads/2024/01/test-image.png',
        metadata: { width: 800, height: 600 },
        description: 'Test image',
        altText: 'Test image alt text',
      };

      const mockCreatedMedia = {
        id: 'media-1',
        filename: createDto.filename,
        originalName: createDto.filename,
        mime: createDto.mimeType,
        size: createDto.size,
        storageKey: createDto.path,
        alt: createDto.altText,
        meta: createDto.metadata,
        width: createDto.metadata?.width,
        height: createDto.metadata?.height,
        createdAt: new Date(),
      };

      (prismaService.media.create as jest.Mock).mockResolvedValue(mockCreatedMedia);

      const result = await mediaService.createMedia(createDto, user);

      expect(prismaService.media.create).toHaveBeenCalledWith({
        data: {
          filename: createDto.filename,
          originalName: createDto.filename,
          mime: createDto.mimeType,
          size: createDto.size,
          storageKey: createDto.path,
          alt: createDto.altText,
          meta: createDto.metadata,
          width: createDto.metadata?.width,
          height: createDto.metadata?.height,
        },
      });
      expect(result).toEqual(mockCreatedMedia);
    });

    it('should throw BadRequestException for invalid file size', async () => {
      const user = { id: 'user-1', role: UserRole.ADMIN };
      const createDto: CreateMediaDto = {
        filename: 'large-image.png',
        type: MediaType.IMAGE,
        mimeType: 'image/png',
        size: 50 * 1024 * 1024, // 50MB - over limit
        path: '/uploads/large-image.png',
      };

      await expect(mediaService.createMedia(createDto, user)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ForbiddenException for unauthorized users', async () => {
      const user = { id: 'user-1', role: UserRole.VIEWER };
      const createDto: CreateMediaDto = {
        filename: 'test-image.png',
        type: MediaType.IMAGE,
        mimeType: 'image/png',
        size: 12345,
        path: '/uploads/test-image.png',
      };

      await expect(mediaService.createMedia(createDto, user)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated media list', async () => {
      const mockMediaList = [
        {
          id: 'media-1',
          filename: 'image1.png',
          originalName: 'image1.png',
          mime: 'image/png',
          size: 12345,
          storageKey: '/uploads/image1.png',
          createdAt: new Date(),
        },
        {
          id: 'media-2',
          filename: 'document.pdf',
          originalName: 'document.pdf',
          mime: 'application/pdf',
          size: 67890,
          storageKey: '/uploads/document.pdf',
          createdAt: new Date(),
        },
      ];

      (prismaService.media.findMany as jest.Mock).mockResolvedValue(mockMediaList);
      (prismaService.media.count as jest.Mock).mockResolvedValue(2);

      const result = await mediaService.findAll({ page: 1, limit: 10 });

      expect(prismaService.media.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {},
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual({
        data: mockMediaList,
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should search media by filename', async () => {
      const mockMediaList = [
        {
          id: 'media-1',
          filename: 'image1.png',
          originalName: 'image1.png',
          mime: 'image/png',
          size: 12345,
          storageKey: '/uploads/image1.png',
          alt: 'Test image',
          createdAt: new Date(),
        },
      ];

      (prismaService.media.findMany as jest.Mock).mockResolvedValue(mockMediaList);
      (prismaService.media.count as jest.Mock).mockResolvedValue(1);

      const result = await mediaService.findAll({
        page: 1,
        limit: 10,
        search: 'image'
      });

      expect(prismaService.media.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {
          OR: [
            { filename: { contains: 'image', mode: 'insensitive' } },
            { originalName: { contains: 'image', mode: 'insensitive' } },
            { alt: { contains: 'image', mode: 'insensitive' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result.data).toEqual(mockMediaList);
    });
  });

  describe('findOne', () => {
    it('should return media by id', async () => {
      const mockMedia = {
        id: 'media-1',
        filename: 'test-image.png',
        originalName: 'test-image.png',
        mime: 'image/png',
        size: 12345,
        storageKey: '/uploads/test-image.png',
        createdAt: new Date(),
      };

      (prismaService.media.findUnique as jest.Mock).mockResolvedValue(mockMedia);

      const result = await mediaService.findOne('media-1');

      expect(prismaService.media.findUnique).toHaveBeenCalledWith({
        where: { id: 'media-1' },
      });
      expect(result).toEqual(mockMedia);
    });

    it('should throw NotFoundException if media not found', async () => {
      (prismaService.media.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(mediaService.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update media successfully', async () => {
      const user = { id: 'user-1', role: UserRole.ADMIN };
      const updateDto: UpdateMediaDto = {
        description: 'Updated description',
        altText: 'Updated alt text',
      };

      const existingMedia = {
        id: 'media-1',
        filename: 'test-image.png',
        originalName: 'test-image.png',
        mime: 'image/png',
        size: 12345,
        storageKey: '/uploads/test-image.png',
        alt: 'Original alt',
        meta: { description: 'Original description' },
        createdAt: new Date(),
      };

      const updatedMedia = {
        ...existingMedia,
        alt: 'Updated alt text',
        meta: { description: 'Updated description' },
      };

      (prismaService.media.findUnique as jest.Mock).mockResolvedValue(existingMedia);
      (prismaService.media.update as jest.Mock).mockResolvedValue(updatedMedia);

      const result = await mediaService.update('media-1', updateDto, user);

      expect(prismaService.media.update).toHaveBeenCalledWith({
        where: { id: 'media-1' },
        data: {
          meta: { description: 'Updated description' },
          alt: 'Updated alt text',
        },
      });
      expect(result).toEqual(updatedMedia);
    });

    it('should throw ForbiddenException if user is not admin or editor', async () => {
      const user = { id: 'user-2', role: UserRole.AUTHOR };
      const updateDto: UpdateMediaDto = { description: 'Updated description' };

      const existingMedia = {
        id: 'media-1',
        filename: 'test-image.png',
        originalName: 'test-image.png',
        mime: 'image/png',
        size: 12345,
        storageKey: '/uploads/test-image.png',
        createdAt: new Date(),
      };

      (prismaService.media.findUnique as jest.Mock).mockResolvedValue(existingMedia);

      await expect(mediaService.update('media-1', updateDto, user)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('remove', () => {
    it('should delete media successfully', async () => {
      const user = { id: 'user-1', role: UserRole.ADMIN };
      const existingMedia = {
        id: 'media-1',
        filename: 'test-image.png',
        originalName: 'test-image.png',
        mime: 'image/png',
        size: 12345,
        storageKey: '/uploads/test-image.png',
        createdAt: new Date(),
      };

      (prismaService.media.findUnique as jest.Mock).mockResolvedValue(existingMedia);
      (prismaService.media.delete as jest.Mock).mockResolvedValue(existingMedia);

      const result = await mediaService.remove('media-1', user);

      expect(prismaService.media.delete).toHaveBeenCalledWith({
        where: { id: 'media-1' },
      });
      expect(result).toEqual(existingMedia);
    });

    it('should throw ForbiddenException if user is not admin or editor', async () => {
      const user = { id: 'user-2', role: UserRole.VIEWER };
      const existingMedia = {
        id: 'media-1',
        filename: 'test-image.png',
        originalName: 'test-image.png',
        mime: 'image/png',
        size: 12345,
        storageKey: '/uploads/test-image.png',
        createdAt: new Date(),
      };

      (prismaService.media.findUnique as jest.Mock).mockResolvedValue(existingMedia);

      await expect(mediaService.remove('media-1', user)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});