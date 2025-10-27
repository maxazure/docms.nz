import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { CreatePostDto, UpdatePostDto, PostQueryDto } from './dto/post.dto';
import { Post, UserRole, ContentStatus } from '@prisma/client';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}
  // Updated to include categoryIds and authorName in findAll response

  async create(createPostDto: CreatePostDto, user: any): Promise<Post> {
    // Check permissions
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.EDITOR && user.role !== UserRole.AUTHOR) {
      throw new ForbiddenException('权限不足');
    }

    // Check if slug already exists
    const existingPost = await this.prisma.post.findUnique({
      where: { slug: createPostDto.slug },
    });

    if (existingPost) {
      throw new BadRequestException('文章URL路径已存在');
    }

    const { categoryIds, tagIds, ...postData } = createPostDto;

    // Prepare post data
    const data: any = {
      ...postData,
      authorId: user.id,
    };

    // Set publishedAt if status is PUBLISHED
    if (createPostDto.status === ContentStatus.PUBLISHED) {
      data.publishedAt = new Date();
    }

    // Create post
    const post = await this.prisma.post.create({
      data,
    });

    // Create category associations
    if (categoryIds && categoryIds.length > 0) {
      await this.prisma.postCategory.createMany({
        data: categoryIds.map((categoryId) => ({
          postId: post.id,
          categoryId,
        })),
      });
    }

    // Create tag associations
    if (tagIds && tagIds.length > 0) {
      await this.prisma.postTag.createMany({
        data: tagIds.map((tagId) => ({
          postId: post.id,
          tagId,
        })),
      });
    }

    return post;
  }

  async findAll(query: PostQueryDto = {}) {
    const { page = 1, limit = 10, status, categoryId, tagId, search, authorId, menuItemId } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (authorId) {
      where.authorId = authorId;
    }

    if (menuItemId) {
      where.menuItemId = menuItemId;
    }

    if (categoryId) {
      where.postCategories = {
        some: {
          categoryId,
        },
      };
    }

    if (tagId) {
      where.postTags = {
        some: {
          tagId,
        },
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { summary: { contains: search } },
      ];
    }

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              displayName: true,
              email: true,
            },
          },
          postCategories: {
            include: {
              category: true,
            },
          },
          postTags: {
            include: {
              tag: true,
            },
          },
        },
      }),
      this.prisma.post.count({ where }),
    ]);

    // Transform data to include categoryIds, tagIds, and authorName
    const data = posts.map((post: any) => ({
      ...post,
      categoryIds: post.postCategories?.map((pc: any) => pc.categoryId) || [],
      tagIds: post.postTags?.map((pt: any) => pt.tagId) || [],
      authorName: post.author?.displayName || 'Unknown',
    }));

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Post> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        postCategories: {
          include: {
            category: true,
          },
        },
        postTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('文章不存在');
    }

    return post;
  }

  async findBySlug(slug: string): Promise<Post> {
    const post = await this.prisma.post.findUnique({
      where: { slug },
      include: {
        postCategories: {
          include: {
            category: true,
          },
        },
        postTags: {
          include: {
            tag: true,
          },
        },
        author: {
          select: {
            id: true,
            email: true,
            displayName: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('文章不存在');
    }

    return post;
  }

  async update(id: string, updatePostDto: UpdatePostDto, user: any): Promise<Post> {
    const post = await this.prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException('文章不存在');
    }

    // Check permissions - only author or admin can update
    if (user.role !== UserRole.ADMIN && post.authorId !== user.id) {
      throw new ForbiddenException('权限不足');
    }

    // Check slug uniqueness if slug is being updated
    if (updatePostDto.slug && updatePostDto.slug !== post.slug) {
      const existingPost = await this.prisma.post.findUnique({
        where: { slug: updatePostDto.slug },
      });

      if (existingPost) {
        throw new BadRequestException('文章URL路径已存在');
      }
    }

    const { categoryIds, tagIds, ...postData } = updatePostDto;

    // Update post
    const updatedPost = await this.prisma.post.update({
      where: { id },
      data: postData,
    });

    // Update category associations if provided
    if (categoryIds !== undefined) {
      await this.prisma.postCategory.deleteMany({
        where: { postId: id },
      });

      if (categoryIds.length > 0) {
        await this.prisma.postCategory.createMany({
          data: categoryIds.map((categoryId) => ({
            postId: id,
            categoryId,
          })),
        });
      }
    }

    // Update tag associations if provided
    if (tagIds !== undefined) {
      await this.prisma.postTag.deleteMany({
        where: { postId: id },
      });

      if (tagIds.length > 0) {
        await this.prisma.postTag.createMany({
          data: tagIds.map((tagId) => ({
            postId: id,
            tagId,
          })),
        });
      }
    }

    return updatedPost;
  }

  async remove(id: string, user: any): Promise<Post> {
    const post = await this.prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException('文章不存在');
    }

    // Check permissions - only author or admin can delete
    if (user.role !== UserRole.ADMIN && post.authorId !== user.id) {
      throw new ForbiddenException('权限不足');
    }

    return this.prisma.post.delete({
      where: { id },
    });
  }

  async publish(id: string, user: any): Promise<Post> {
    // Only admin can publish
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('权限不足');
    }

    const post = await this.prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException('文章不存在');
    }

    if (post.status === ContentStatus.PUBLISHED) {
      throw new BadRequestException('文章已发布');
    }

    return this.prisma.post.update({
      where: { id },
      data: {
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });
  }

  async getCategories() {
    const categories = await this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });

    return {
      success: true,
      data: categories,
    };
  }

  async getTags() {
    const tags = await this.prisma.tag.findMany({
      orderBy: { name: 'asc' },
    });

    return {
      success: true,
      data: tags,
    };
  }
}
