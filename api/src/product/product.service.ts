import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from './dto/product.dto';
import { Product, UserRole } from '@prisma/client';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto, user: any): Promise<Product> {
    // Check permissions - only ADMIN and EDITOR can create products
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.EDITOR) {
      throw new ForbiddenException('权限不足');
    }

    // Check if slug already exists
    const existingProduct = await this.prisma.product.findUnique({
      where: { slug: createProductDto.slug },
    });

    if (existingProduct) {
      throw new BadRequestException('产品URL路径已存在');
    }

    const { categoryId, tagIds, ...productData } = createProductDto;

    // Create product
    const product = await this.prisma.product.create({
      data: {
        ...productData,
        categoryId,
        tags: tagIds ? tagIds : undefined, // Store tags as JSON array
      },
    });

    return product;
  }

  async findAll(query: ProductQueryDto = {}) {
    const { page = 1, limit = 10, categoryId, search, minPrice, maxPrice, isActive, isFeatured } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        where.price.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.price.lte = maxPrice;
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException('产品不存在');
    }

    return product;
  }

  async findBySlug(slug: string): Promise<Product> {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException('产品不存在');
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: any): Promise<Product> {
    // Check permissions - only ADMIN and EDITOR can update products
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.EDITOR) {
      throw new ForbiddenException('权限不足');
    }

    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('产品不存在');
    }

    // Check slug uniqueness if slug is being updated
    if (updateProductDto.slug && updateProductDto.slug !== product.slug) {
      const existingProduct = await this.prisma.product.findUnique({
        where: { slug: updateProductDto.slug },
      });

      if (existingProduct) {
        throw new BadRequestException('产品URL路径已存在');
      }
    }

    const { categoryId, tagIds, ...productData } = updateProductDto;

    // Prepare update data
    const updateData: any = { ...productData };
    if (categoryId !== undefined) {
      updateData.categoryId = categoryId;
    }
    if (tagIds !== undefined) {
      updateData.tags = tagIds;
    }

    // Update product
    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: updateData,
    });

    return updatedProduct;
  }

  async remove(id: string, user: any): Promise<Product> {
    // Check permissions - only ADMIN and EDITOR can delete products
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.EDITOR) {
      throw new ForbiddenException('权限不足');
    }

    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('产品不存在');
    }

    return this.prisma.product.delete({
      where: { id },
    });
  }

  async toggleActive(id: string, user: any): Promise<Product> {
    // Only admin can toggle active status
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('权限不足');
    }

    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('产品不存在');
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        isActive: !product.isActive,
      },
    });
  }

  async toggleFeatured(id: string, user: any): Promise<Product> {
    // Only admin can toggle featured status
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('权限不足');
    }

    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('产品不存在');
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        isFeatured: !product.isFeatured,
      },
    });
  }
}
