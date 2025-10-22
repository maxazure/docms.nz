import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { Tag, UserRole } from '@prisma/client';
import { CreateTagDto, UpdateTagDto, TagQueryDto } from './dto/tag.dto';

@Injectable()
export class TagService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new tag
   */
  async create(createTagDto: CreateTagDto, user?: any): Promise<Tag> {
    // Check permissions
    if (user && ![UserRole.ADMIN, UserRole.EDITOR].includes(user.role)) {
      throw new ForbiddenException('权限不足');
    }

    // Check if slug is unique
    const existingTag = await this.prisma.tag.findUnique({
      where: { slug: createTagDto.slug },
    });

    if (existingTag) {
      throw new BadRequestException('标签URL路径已存在');
    }

    const tag = await this.prisma.tag.create({
      data: createTagDto,
    });

    return tag;
  }

  /**
   * Get all tags
   */
  async findAll(query: TagQueryDto = {}): Promise<Tag[]> {
    const where: any = {};

    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { slug: { contains: query.search } },
      ];
    }

    const tags = await this.prisma.tag.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return tags;
  }

  /**
   * Get tag by ID
   */
  async findOne(id: string): Promise<Tag> {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
    });

    if (!tag) {
      throw new NotFoundException('标签不存在');
    }

    return tag;
  }

  /**
   * Update tag
   */
  async update(id: string, updateTagDto: UpdateTagDto, user?: any): Promise<Tag> {
    // Check permissions
    if (user && ![UserRole.ADMIN, UserRole.EDITOR].includes(user.role)) {
      throw new ForbiddenException('权限不足');
    }

    const existingTag = await this.prisma.tag.findUnique({
      where: { id },
    });

    if (!existingTag) {
      throw new NotFoundException('标签不存在');
    }

    // If updating slug, check uniqueness
    if (updateTagDto.slug && updateTagDto.slug !== existingTag.slug) {
      const slugExists = await this.prisma.tag.findUnique({
        where: { slug: updateTagDto.slug },
      });

      if (slugExists) {
        throw new BadRequestException('标签URL路径已存在');
      }
    }

    const updatedTag = await this.prisma.tag.update({
      where: { id },
      data: updateTagDto,
    });

    return updatedTag;
  }

  /**
   * Delete tag
   */
  async remove(id: string, user?: any): Promise<Tag> {
    // Check permissions
    if (user && ![UserRole.ADMIN, UserRole.EDITOR].includes(user.role)) {
      throw new ForbiddenException('权限不足');
    }

    const tag = await this.prisma.tag.findUnique({
      where: { id },
    });

    if (!tag) {
      throw new NotFoundException('标签不存在');
    }

    const deletedTag = await this.prisma.tag.delete({
      where: { id },
    });

    return deletedTag;
  }
}
