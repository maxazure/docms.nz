import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from './post.service';
import { PrismaService } from '../common/services/prisma.service';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { UserRole, ContentStatus } from '@prisma/client';

describe('PostService', () => {
  let service: PostService;
  let prisma: PrismaService;

  const mockPrismaService = {
    post: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    postCategory: {
      createMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    postTag: {
      createMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  const mockAdmin = {
    id: 'admin-id',
    role: UserRole.ADMIN,
    email: 'admin@test.com',
  };

  const mockAuthor = {
    id: 'author-id',
    role: UserRole.AUTHOR,
    email: 'author@test.com',
  };

  const mockViewer = {
    id: 'viewer-id',
    role: UserRole.VIEWER,
    email: 'viewer@test.com',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PostService>(PostService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      title: '水培技术入门指南',
      slug: 'hydroponics-guide',
      summary: '了解水培种植的基础知识',
      content: { type: 'html', data: '<p>内容...</p>' },
      status: ContentStatus.DRAFT,
      categoryIds: ['cat-1', 'cat-2'],
      tagIds: ['tag-1', 'tag-2'],
    };

    it('should create a post successfully', async () => {
      const mockPost = {
        id: 'post-1',
        title: createDto.title,
        slug: createDto.slug,
        summary: createDto.summary,
        content: createDto.content,
        status: createDto.status,
        authorId: mockAuthor.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.post.findUnique.mockResolvedValue(null);
      mockPrismaService.post.create.mockResolvedValue(mockPost);
      mockPrismaService.postCategory.createMany.mockResolvedValue({ count: 2 });
      mockPrismaService.postTag.createMany.mockResolvedValue({ count: 2 });

      const result = await service.create(createDto, mockAuthor);

      expect(result).toEqual(mockPost);
      expect(mockPrismaService.post.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: createDto.title,
          slug: createDto.slug,
          authorId: mockAuthor.id,
        }),
      });
    });

    it('should throw BadRequestException if slug already exists', async () => {
      mockPrismaService.post.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(service.create(createDto, mockAuthor)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(createDto, mockAuthor)).rejects.toThrow(
        '文章URL路径已存在',
      );
    });

    it('should throw ForbiddenException if user does not have permission', async () => {
      await expect(service.create(createDto, mockViewer)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should set publishedAt when status is PUBLISHED', async () => {
      const publishDto = { ...createDto, status: ContentStatus.PUBLISHED };

      mockPrismaService.post.findUnique.mockResolvedValue(null);
      mockPrismaService.post.create.mockResolvedValue({
        id: 'post-1',
        publishedAt: new Date(),
      });

      await service.create(publishDto, mockAuthor);

      expect(mockPrismaService.post.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: ContentStatus.PUBLISHED,
          publishedAt: expect.any(Date),
        }),
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated posts', async () => {
      const mockPosts = [
        { id: 'post-1', title: 'Post 1', status: ContentStatus.PUBLISHED },
        { id: 'post-2', title: 'Post 2', status: ContentStatus.PUBLISHED },
      ];

      mockPrismaService.post.findMany.mockResolvedValue(mockPosts);
      mockPrismaService.post.count.mockResolvedValue(2);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toEqual(mockPosts);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should filter by status', async () => {
      mockPrismaService.post.findMany.mockResolvedValue([]);
      mockPrismaService.post.count.mockResolvedValue(0);

      await service.findAll({ status: ContentStatus.DRAFT });

      expect(mockPrismaService.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: ContentStatus.DRAFT,
          }),
        }),
      );
    });

    it('should search by title and summary', async () => {
      mockPrismaService.post.findMany.mockResolvedValue([]);
      mockPrismaService.post.count.mockResolvedValue(0);

      await service.findAll({ search: '水培' });

      expect(mockPrismaService.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { title: { contains: '水培', mode: 'insensitive' } },
              { summary: { contains: '水培', mode: 'insensitive' } },
            ]),
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a post by id', async () => {
      const mockPost = {
        id: 'post-1',
        title: 'Post 1',
        postCategories: [],
        postTags: [],
      };

      mockPrismaService.post.findUnique.mockResolvedValue(mockPost);

      const result = await service.findOne('post-1');

      expect(result).toEqual(mockPost);
      expect(mockPrismaService.post.findUnique).toHaveBeenCalledWith({
        where: { id: 'post-1' },
        include: expect.objectContaining({
          postCategories: expect.any(Object),
          postTags: expect.any(Object),
        }),
      });
    });

    it('should throw NotFoundException if post not found', async () => {
      mockPrismaService.post.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateDto = {
      title: 'Updated Title',
      categoryIds: ['cat-3'],
      tagIds: ['tag-3'],
    };

    it('should update a post successfully', async () => {
      const existingPost = {
        id: 'post-1',
        title: 'Original',
        authorId: mockAuthor.id,
      };

      const updatedPost = {
        ...existingPost,
        ...updateDto,
      };

      mockPrismaService.post.findUnique.mockResolvedValue(existingPost);
      mockPrismaService.post.update.mockResolvedValue(updatedPost);
      mockPrismaService.postCategory.deleteMany.mockResolvedValue({ count: 0 });
      mockPrismaService.postCategory.createMany.mockResolvedValue({ count: 1 });
      mockPrismaService.postTag.deleteMany.mockResolvedValue({ count: 0 });
      mockPrismaService.postTag.createMany.mockResolvedValue({ count: 1 });

      const result = await service.update('post-1', updateDto, mockAuthor);

      expect(mockPrismaService.post.update).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user is not author or admin', async () => {
      const existingPost = {
        id: 'post-1',
        authorId: 'other-author-id',
      };

      mockPrismaService.post.findUnique.mockResolvedValue(existingPost);

      await expect(service.update('post-1', updateDto, mockAuthor)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should allow admin to update any post', async () => {
      const existingPost = {
        id: 'post-1',
        authorId: 'other-author-id',
      };

      mockPrismaService.post.findUnique.mockResolvedValue(existingPost);
      mockPrismaService.post.update.mockResolvedValue(existingPost);

      await service.update('post-1', updateDto, mockAdmin);

      expect(mockPrismaService.post.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a post successfully', async () => {
      const mockPost = {
        id: 'post-1',
        authorId: mockAuthor.id,
      };

      mockPrismaService.post.findUnique.mockResolvedValue(mockPost);
      mockPrismaService.post.delete.mockResolvedValue(mockPost);

      const result = await service.remove('post-1', mockAuthor);

      expect(result).toEqual(mockPost);
    });

    it('should throw ForbiddenException if user is not author or admin', async () => {
      const mockPost = {
        id: 'post-1',
        authorId: 'other-author-id',
      };

      mockPrismaService.post.findUnique.mockResolvedValue(mockPost);

      await expect(service.remove('post-1', mockAuthor)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('publish', () => {
    it('should publish a draft post', async () => {
      const draftPost = {
        id: 'post-1',
        status: ContentStatus.DRAFT,
        authorId: mockAuthor.id,
      };

      const publishedPost = {
        ...draftPost,
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
      };

      mockPrismaService.post.findUnique.mockResolvedValue(draftPost);
      mockPrismaService.post.update.mockResolvedValue(publishedPost);

      const result = await service.publish('post-1', mockAdmin);

      expect(result.status).toBe(ContentStatus.PUBLISHED);
      expect(result.publishedAt).toBeDefined();
    });

    it('should throw BadRequestException if post is already published', async () => {
      const publishedPost = {
        id: 'post-1',
        status: ContentStatus.PUBLISHED,
      };

      mockPrismaService.post.findUnique.mockResolvedValue(publishedPost);

      await expect(service.publish('post-1', mockAdmin)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should only allow admin to publish', async () => {
      const draftPost = {
        id: 'post-1',
        status: ContentStatus.DRAFT,
        authorId: mockAuthor.id,
      };

      mockPrismaService.post.findUnique.mockResolvedValue(draftPost);

      await expect(service.publish('post-1', mockAuthor)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
