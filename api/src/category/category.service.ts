import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { Category, UserRole } from '@prisma/client';
import { CreateCategoryDto, UpdateCategoryDto, CategoryQueryDto } from './dto/category.dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new category
   */
  async create(createCategoryDto: CreateCategoryDto, user?: any): Promise<Category> {
    // Check permissions
    if (user && ![UserRole.ADMIN, UserRole.EDITOR].includes(user.role)) {
      throw new ForbiddenException('权限不足');
    }

    // Check if slug is unique
    const existingCategory = await this.prisma.category.findUnique({
      where: { slug: createCategoryDto.slug },
    });

    if (existingCategory) {
      throw new BadRequestException('分类URL路径已存在');
    }

    // If parentId is provided, verify parent exists
    if (createCategoryDto.parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: createCategoryDto.parentId },
      });

      if (!parent) {
        throw new NotFoundException('父分类不存在');
      }
    }

    const category = await this.prisma.category.create({
      data: {
        name: createCategoryDto.name,
        slug: createCategoryDto.slug,
        parentId: createCategoryDto.parentId,
        order: createCategoryDto.order || 0,
        isActive: true,
      },
    });

    return category;
  }

  /**
   * Get all categories
   */
  async findAll(query: CategoryQueryDto = {}): Promise<Category[]> {
    const where: any = {};

    if (!query.includeInactive) {
      where.isActive = true;
    }

    const categories = await this.prisma.category.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    return categories;
  }

  /**
   * Get category by ID
   */
  async findOne(id: string): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    return category;
  }

  /**
   * Get category tree structure
   */
  async getTree(): Promise<any[]> {
    const allCategories = await this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });

    // Build tree structure
    const categoryMap = new Map();
    const roots: any[] = [];

    // First pass: create map
    allCategories.forEach((cat) => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    // Second pass: build tree
    allCategories.forEach((cat) => {
      const node = categoryMap.get(cat.id);
      if (cat.parentId) {
        const parent = categoryMap.get(cat.parentId);
        if (parent) {
          parent.children.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  /**
   * Update category
   */
  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    user?: any,
  ): Promise<Category> {
    // Check permissions
    if (user && ![UserRole.ADMIN, UserRole.EDITOR].includes(user.role)) {
      throw new ForbiddenException('权限不足');
    }

    const existingCategory = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      throw new NotFoundException('分类不存在');
    }

    // Check for circular parent reference
    if (updateCategoryDto.parentId === id) {
      throw new BadRequestException('不能将分类设置为自己的父分类');
    }

    // If updating slug, check uniqueness
    if (updateCategoryDto.slug && updateCategoryDto.slug !== existingCategory.slug) {
      const slugExists = await this.prisma.category.findUnique({
        where: { slug: updateCategoryDto.slug },
      });

      if (slugExists) {
        throw new BadRequestException('分类URL路径已存在');
      }
    }

    // If updating parentId, verify parent exists
    if (updateCategoryDto.parentId !== undefined && updateCategoryDto.parentId !== null) {
      const parent = await this.prisma.category.findUnique({
        where: { id: updateCategoryDto.parentId },
      });

      if (!parent) {
        throw new NotFoundException('父分类不存在');
      }
    }

    const updatedCategory = await this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });

    return updatedCategory;
  }

  /**
   * Delete category
   */
  async remove(id: string, user?: any): Promise<Category> {
    // Check permissions
    if (user && ![UserRole.ADMIN, UserRole.EDITOR].includes(user.role)) {
      throw new ForbiddenException('权限不足');
    }

    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        children: true,
      },
    });

    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    // Check if category has children
    if (category.children && category.children.length > 0) {
      throw new BadRequestException('该分类下有子分类，无法删除');
    }

    const deletedCategory = await this.prisma.category.delete({
      where: { id },
    });

    return deletedCategory;
  }

  /**
   * Toggle category active status
   */
  async toggleActive(id: string, user?: any): Promise<Category> {
    // Check permissions
    if (user && ![UserRole.ADMIN, UserRole.EDITOR].includes(user.role)) {
      throw new ForbiddenException('权限不足');
    }

    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    const updatedCategory = await this.prisma.category.update({
      where: { id },
      data: { isActive: !category.isActive },
    });

    return updatedCategory;
  }
}
