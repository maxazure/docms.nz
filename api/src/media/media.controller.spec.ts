import { Test, TestingModule } from '@nestjs/testing';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CreateMediaDto, UpdateMediaDto, MediaType } from './dto/media.dto';

describe('MediaController', () => {
  let mediaController: MediaController;
  let mediaService: MediaService;

  beforeEach(async () => {
    const mockMediaService = {
      createMedia: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediaController],
      providers: [
        {
          provide: MediaService,
          useValue: mockMediaService,
        },
      ],
    }).compile();

    mediaController = module.get<MediaController>(MediaController);
    mediaService = module.get<MediaService>(MediaService);
  });

  it('should be defined', () => {
    expect(mediaController).toBeDefined();
    expect(mediaService).toBeDefined();
  });

  describe('create', () => {
    it('should create media successfully', async () => {
      const user = { id: 'user-1', role: UserRole.ADMIN };
      const createDto: CreateMediaDto = {
        filename: 'test-image.png',
        type: MediaType.IMAGE,
        mimeType: 'image/png',
        size: 12345,
        path: '/uploads/test-image.png',
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

      (mediaService.createMedia as jest.Mock).mockResolvedValue(mockCreatedMedia);

      const result = await mediaController.create(createDto, user);

      expect(mediaService.createMedia).toHaveBeenCalledWith(createDto, user);
      expect(result).toEqual({
        success: true,
        message: '媒体文件上传成功',
        data: mockCreatedMedia,
      });
    });

    it('should handle ForbiddenException from service', async () => {
      const user = { id: 'user-1', role: UserRole.VIEWER };
      const createDto: CreateMediaDto = {
        filename: 'test-image.png',
        type: MediaType.IMAGE,
        mimeType: 'image/png',
        size: 12345,
        path: '/uploads/test-image.png',
      };

      (mediaService.createMedia as jest.Mock).mockRejectedValue(
        new ForbiddenException('权限不足')
      );

      const result = await mediaController.create(createDto, user);

      expect(result).toEqual({
        success: false,
        message: '权限不足',
        data: null,
      });
    });

    it('should handle BadRequestException from service', async () => {
      const user = { id: 'user-1', role: UserRole.ADMIN };
      const createDto: CreateMediaDto = {
        filename: 'large-image.png',
        type: MediaType.IMAGE,
        mimeType: 'image/png',
        size: 50 * 1024 * 1024, // 50MB
        path: '/uploads/large-image.png',
      };

      (mediaService.createMedia as jest.Mock).mockRejectedValue(
        new BadRequestException('文件大小超过限制')
      );

      const result = await mediaController.create(createDto, user);

      expect(result).toEqual({
        success: false,
        message: '文件大小超过限制',
        data: null,
      });
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

      const mockResponse = {
        data: mockMediaList,
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      (mediaService.findAll as jest.Mock).mockResolvedValue(mockResponse);

      const result = await mediaController.findAll({ page: 1, limit: 10 });

      expect(mediaService.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
      expect(result).toEqual({
        success: true,
        data: mockResponse,
      });
    });

    it('should handle search parameters', async () => {
      const searchQuery = 'image';
      const mockResponse = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };

      (mediaService.findAll as jest.Mock).mockResolvedValue(mockResponse);

      const result = await mediaController.findAll({
        page: 1,
        limit: 10,
        search: searchQuery
      });

      expect(mediaService.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: searchQuery
      });
      expect(result).toEqual({
        success: true,
        data: mockResponse,
      });
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

      (mediaService.findOne as jest.Mock).mockResolvedValue(mockMedia);

      const result = await mediaController.findOne('media-1');

      expect(mediaService.findOne).toHaveBeenCalledWith('media-1');
      expect(result).toEqual({
        success: true,
        data: mockMedia,
      });
    });

    it('should handle NotFoundException from service', async () => {
      (mediaService.findOne as jest.Mock).mockRejectedValue(
        new NotFoundException('媒体文件未找到')
      );

      const result = await mediaController.findOne('non-existent');

      expect(result).toEqual({
        success: false,
        message: '媒体文件未找到',
        data: null,
      });
    });
  });

  describe('update', () => {
    it('should update media successfully', async () => {
      const user = { id: 'user-1', role: UserRole.ADMIN };
      const updateDto: UpdateMediaDto = {
        description: 'Updated description',
        altText: 'Updated alt text',
      };

      const mockUpdatedMedia = {
        id: 'media-1',
        filename: 'test-image.png',
        originalName: 'test-image.png',
        mime: 'image/png',
        size: 12345,
        storageKey: '/uploads/test-image.png',
        alt: 'Updated alt text',
        meta: { description: 'Updated description' },
        createdAt: new Date(),
      };

      (mediaService.update as jest.Mock).mockResolvedValue(mockUpdatedMedia);

      const result = await mediaController.update('media-1', updateDto, user);

      expect(mediaService.update).toHaveBeenCalledWith('media-1', updateDto, user);
      expect(result).toEqual({
        success: true,
        message: '媒体文件更新成功',
        data: mockUpdatedMedia,
      });
    });

    it('should handle ForbiddenException from service', async () => {
      const user = { id: 'user-1', role: UserRole.AUTHOR };
      const updateDto: UpdateMediaDto = { description: 'Updated description' };

      (mediaService.update as jest.Mock).mockRejectedValue(
        new ForbiddenException('权限不足')
      );

      const result = await mediaController.update('media-1', updateDto, user);

      expect(result).toEqual({
        success: false,
        message: '权限不足',
        data: null,
      });
    });
  });

  describe('remove', () => {
    it('should delete media successfully', async () => {
      const user = { id: 'user-1', role: UserRole.ADMIN };
      const mockDeletedMedia = {
        id: 'media-1',
        filename: 'test-image.png',
        originalName: 'test-image.png',
        mime: 'image/png',
        size: 12345,
        storageKey: '/uploads/test-image.png',
        createdAt: new Date(),
      };

      (mediaService.remove as jest.Mock).mockResolvedValue(mockDeletedMedia);

      const result = await mediaController.remove('media-1', user);

      expect(mediaService.remove).toHaveBeenCalledWith('media-1', user);
      expect(result).toEqual({
        success: true,
        message: '媒体文件删除成功',
        data: mockDeletedMedia,
      });
    });

    it('should handle ForbiddenException from service', async () => {
      const user = { id: 'user-1', role: UserRole.VIEWER };

      (mediaService.remove as jest.Mock).mockRejectedValue(
        new ForbiddenException('权限不足')
      );

      const result = await mediaController.remove('media-1', user);

      expect(result).toEqual({
        success: false,
        message: '权限不足',
        data: null,
      });
    });

    it('should handle NotFoundException from service', async () => {
      const user = { id: 'user-1', role: UserRole.ADMIN };

      (mediaService.remove as jest.Mock).mockRejectedValue(
        new NotFoundException('媒体文件未找到')
      );

      const result = await mediaController.remove('non-existent', user);

      expect(result).toEqual({
        success: false,
        message: '媒体文件未找到',
        data: null,
      });
    });
  });
});