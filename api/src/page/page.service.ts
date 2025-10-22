import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { Page, PageVersion, UserRole, PageStatus, BlockType, ContentStatus } from '@prisma/client';
import { CreatePageDto, UpdatePageDto, PageQueryDto } from './dto/page.dto';
import { BlockRegistryService } from '../blocks/block-registry.service';
import * as crypto from 'crypto';

@Injectable()
export class PageService {
  constructor(
    private prisma: PrismaService,
    private blockRegistry: BlockRegistryService,
  ) {}

  /**
   * Create new page with block-based content
   */
  async create(createPageDto: CreatePageDto, user?: any): Promise<Page> {
    // Check permissions - only ADMIN, EDITOR, and AUTHOR can create pages
    if (user && ![UserRole.ADMIN, UserRole.EDITOR, UserRole.AUTHOR].includes(user.role)) {
      throw new ForbiddenException('权限不足');
    }

    // Validate required fields
    if (!createPageDto.title || !createPageDto.slug) {
      throw new BadRequestException('页面标题和URL路径不能为空');
    }

    // Check if slug is unique
    const existingPage = await this.prisma.page.findUnique({
      where: { slug: createPageDto.slug },
    });

    if (existingPage) {
      throw new BadRequestException('页面URL路径已存在');
    }

    // Validate all blocks
    if (createPageDto.blocks && Array.isArray(createPageDto.blocks)) {
      for (const block of createPageDto.blocks) {
        const validation = this.blockRegistry.validate(block.type, block.props || {});
        if (!validation.valid) {
          throw new BadRequestException(`区块验证失败: ${validation.errors?.join(', ')}`);
        }
      }
    }

    const page = await this.prisma.page.create({
      data: {
        title: createPageDto.title,
        slug: createPageDto.slug,
        blocks: createPageDto.blocks as any,
        status: createPageDto.status || PageStatus.DRAFT,
        meta: createPageDto.meta || {},
        menuItemId: createPageDto.menuItemId,
        publishedAt: createPageDto.status === PageStatus.PUBLISHED ? new Date() : null,
      },
    });

    // Create page version with initial blocks
    const initialVersion = await this.prisma.pageVersion.create({
      data: {
        pageId: page.id,
        blocks: createPageDto.blocks as any,
        createdBy: user?.id,
      },
    });

    return page;
  }

  /**
   * Get all pages with pagination and filtering
   */
  async findAll(query: PageQueryDto = {}): Promise<{
    data: Page[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page: pageNum = 1, limit = 10, search, status } = query;
    const skip = (pageNum - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    
    
    const [pages, total] = await Promise.all([
      this.prisma.page.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.page.count({ where }),
    ]);

    return {
      data: pages,
      total,
      page: pageNum,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get page by ID with version history
   */
  async findOne(id: string): Promise<Page> {
    const page = await this.prisma.page.findUnique({
      where: { id },
      include: {
        versions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!page) {
      throw new NotFoundException('页面未找到');
    }

    return page;
  }

  /**
   * Get page by slug
   */
  async getPageBySlug(slug: string): Promise<Page> {
    const page = await this.prisma.page.findUnique({
      where: { slug },
      include: {
        versions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!page) {
      throw new NotFoundException('页面未找到');
    }

    return page;
  }

  /**
   * Update page
   */
  async update(id: string, updatePageDto: UpdatePageDto, user?: any): Promise<Page> {
    const existingPage = await this.findOne(id);

    // Check permissions - only ADMIN and EDITOR can update pages
    if (user && ![UserRole.ADMIN, UserRole.EDITOR].includes(user.role)) {
      throw new ForbiddenException('权限不足');
    }

    // Validate published page cannot become draft
    if (existingPage.status === PageStatus.PUBLISHED && updatePageDto.status === PageStatus.DRAFT) {
      throw new BadRequestException('已发布的页面不能变为草稿状态');
    }

    const updateData: any = {};
    if (updatePageDto.title) updateData.title = updatePageDto.title;
    if (updatePageDto.status) updateData.status = updatePageDto.status;
    if (updatePageDto.blocks) updateData.blocks = updatePageDto.blocks as any;
    if (updatePageDto.meta) updateData.meta = updatePageDto.meta;

    const updatedPage = await this.prisma.page.update({
      where: { id },
      data: updateData,
    });

    // Create new version if blocks are updated
    if (updatePageDto.blocks) {
      const newVersion = await this.prisma.pageVersion.create({
        data: {
          pageId: id,
          blocks: updatePageDto.blocks as any,
          createdBy: user?.id,
        },
      });
    }

    return updatedPage;
  }

  /**
   * Delete page
   */
  async remove(id: string, user?: any): Promise<Page> {
    const existingPage = await this.findOne(id);

    // Check permissions - only ADMIN and EDITOR can delete pages
    if (user && ![UserRole.ADMIN, UserRole.EDITOR].includes(user.role)) {
      throw new ForbiddenException('权限不足');
    }

    // Check if page is linked to menu
    if (existingPage.menuItemId) {
      const menuItem = await this.prisma.menuItem.findUnique({
        where: { id: existingPage.menuItemId },
      });

      if (menuItem) {
        throw new BadRequestException('无法删除关联到菜单的页面');
      }
    }

    const deletedPage = await this.prisma.page.delete({
      where: { id },
    });

    return deletedPage;
  }

  /**
   * Publish page
   */
  async publish(id: string, user?: any): Promise<Page> {
    const existingPage = await this.findOne(id);

    // Check permissions - only ADMIN can publish pages
    if (user && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('只有管理员可以发布页面');
    }

    if (existingPage.status === PageStatus.PUBLISHED) {
      throw new BadRequestException('页面已经是发布状态');
    }

    const publishedPage = await this.prisma.page.update({
      where: { id },
      data: {
        status: PageStatus.PUBLISHED,
        publishedAt: new Date()
      },
    });

    return publishedPage;
  }

  /**
   * Duplicate page
   */
  async duplicate(id: string, user?: any): Promise<Page> {
    const originalPage = await this.findOne(id);

    // Check permissions
    if (user && ![UserRole.ADMIN, UserRole.EDITOR].includes(user.role)) {
      throw new ForbiddenException('权限不足');
    }

    if (!originalPage) {
      throw new NotFoundException('原页面未找到');
    }

    // Create new page with copied content
    const duplicatedPage = await this.prisma.page.create({
      data: {
        title: `${originalPage.title} (副本)`,
        slug: `${originalPage.slug}-copy`,
        blocks: originalPage.blocks,
        status: ContentStatus.DRAFT,
        meta: originalPage.meta,
        menuItemId: originalPage.menuItemId,
      },
    });

    // Copy versions
    const originalVersions = await this.prisma.pageVersion.findMany({
      where: { pageId: originalPage.id },
    });

    for (const version of originalVersions) {
      await this.prisma.pageVersion.create({
        data: {
          pageId: duplicatedPage.id,
          blocks: version.blocks,
          createdBy: version.createdBy,
        },
      });
    }

    return duplicatedPage;
  }

  /**
   * Reorder blocks in a page
   */
  async reorderBlocks(id: string, blockIds: string[], user?: any): Promise<Page> {
    const page = await this.findOne(id);

    // Check permissions
    if (user && ![UserRole.ADMIN, UserRole.EDITOR, UserRole.AUTHOR].includes(user.role)) {
      throw new ForbiddenException('权限不足');
    }

    const blocks = page.blocks as any[];
    if (!Array.isArray(blocks)) {
      throw new BadRequestException('页面区块数据格式错误');
    }

    // Create a map of blocks by id
    const blockMap = new Map(blocks.map((block) => [block.id, block]));

    // Reorder blocks based on the provided IDs
    const reorderedBlocks = blockIds.map((blockId, index) => {
      const block = blockMap.get(blockId);
      if (!block) {
        throw new BadRequestException(`区块 ${blockId} 不存在`);
      }
      return { ...block, order: index + 1 };
    });

    // Update page with reordered blocks
    const updatedPage = await this.prisma.page.update({
      where: { id },
      data: { blocks: reorderedBlocks as any },
    });

    // Create new version
    await this.prisma.pageVersion.create({
      data: {
        pageId: id,
        blocks: reorderedBlocks as any,
        createdBy: user?.id,
      },
    });

    return updatedPage;
  }

  /**
   * Add a new block to a page
   */
  async addBlock(
    id: string,
    blockData: { type: string; props?: any; order?: number },
    user?: any,
  ): Promise<Page> {
    const page = await this.findOne(id);

    // Check permissions
    if (user && ![UserRole.ADMIN, UserRole.EDITOR, UserRole.AUTHOR].includes(user.role)) {
      throw new ForbiddenException('权限不足');
    }

    // Validate block type and props
    const validation = this.blockRegistry.validate(blockData.type as any, blockData.props || {});
    if (!validation.valid) {
      throw new BadRequestException(`区块验证失败: ${validation.errors?.join(', ')}`);
    }

    const blocks = (page.blocks as any[]) || [];

    // Create new block using BlockRegistry
    const newBlock = this.blockRegistry.createBlock(blockData.type as any, {
      props: blockData.props,
      order: blockData.order !== undefined ? blockData.order : blocks.length + 1,
      visibility: true,
    });

    // Add new block
    const updatedBlocks = [...blocks, newBlock];

    // Update page
    const updatedPage = await this.prisma.page.update({
      where: { id },
      data: { blocks: updatedBlocks as any },
    });

    // Create new version
    await this.prisma.pageVersion.create({
      data: {
        pageId: id,
        blocks: updatedBlocks as any,
        createdBy: user?.id,
      },
    });

    return updatedPage;
  }

  /**
   * Update a specific block in a page
   */
  async updateBlock(
    id: string,
    blockId: string,
    updates: { props?: any; visibility?: boolean },
    user?: any,
  ): Promise<Page> {
    const page = await this.findOne(id);

    // Check permissions
    if (user && ![UserRole.ADMIN, UserRole.EDITOR, UserRole.AUTHOR].includes(user.role)) {
      throw new ForbiddenException('权限不足');
    }

    const blocks = page.blocks as any[];
    if (!Array.isArray(blocks)) {
      throw new BadRequestException('页面区块数据格式错误');
    }

    const blockIndex = blocks.findIndex((block) => block.id === blockId);
    if (blockIndex === -1) {
      throw new NotFoundException('区块不存在');
    }

    const block = blocks[blockIndex];

    // If props are being updated, validate them
    if (updates.props) {
      const validation = this.blockRegistry.validate(block.type, updates.props);
      if (!validation.valid) {
        throw new BadRequestException(`区块验证失败: ${validation.errors?.join(', ')}`);
      }
    }

    // Update block
    const updatedBlock = {
      ...block,
      ...(updates.props && { props: { ...block.props, ...updates.props } }),
      ...(updates.visibility !== undefined && { visibility: updates.visibility }),
    };

    blocks[blockIndex] = updatedBlock;

    // Update page
    const updatedPage = await this.prisma.page.update({
      where: { id },
      data: { blocks: blocks as any },
    });

    // Create new version
    await this.prisma.pageVersion.create({
      data: {
        pageId: id,
        blocks: blocks as any,
        createdBy: user?.id,
      },
    });

    return updatedPage;
  }

  /**
   * Remove a block from a page
   */
  async removeBlock(id: string, blockId: string, user?: any): Promise<Page> {
    const page = await this.findOne(id);

    // Check permissions
    if (user && ![UserRole.ADMIN, UserRole.EDITOR, UserRole.AUTHOR].includes(user.role)) {
      throw new ForbiddenException('权限不足');
    }

    const blocks = page.blocks as any[];
    if (!Array.isArray(blocks)) {
      throw new BadRequestException('页面区块数据格式错误');
    }

    const blockIndex = blocks.findIndex((block) => block.id === blockId);
    if (blockIndex === -1) {
      throw new NotFoundException('区块不存在');
    }

    // Remove block
    const updatedBlocks = blocks.filter((block) => block.id !== blockId);

    // Update page
    const updatedPage = await this.prisma.page.update({
      where: { id },
      data: { blocks: updatedBlocks as any },
    });

    // Create new version
    await this.prisma.pageVersion.create({
      data: {
        pageId: id,
        blocks: updatedBlocks as any,
        createdBy: user?.id,
      },
    });

    return updatedPage;
  }

  /**
   * Get version history for a page
   */
  async getVersions(id: string): Promise<PageVersion[]> {
    const page = await this.findOne(id);

    const versions = await this.prisma.pageVersion.findMany({
      where: { pageId: id },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
          },
        },
      },
    });

    return versions;
  }

  /**
   * Restore a page to a specific version
   */
  async restoreVersion(id: string, versionId: string, user?: any): Promise<Page> {
    const page = await this.findOne(id);

    // Check permissions
    if (user && ![UserRole.ADMIN, UserRole.EDITOR].includes(user.role)) {
      throw new ForbiddenException('权限不足');
    }

    const version = await this.prisma.pageVersion.findUnique({
      where: { id: versionId },
    });

    if (!version || version.pageId !== id) {
      throw new NotFoundException('版本不存在');
    }

    // Restore blocks from version
    const updatedPage = await this.prisma.page.update({
      where: { id },
      data: { blocks: version.blocks },
    });

    // Create new version entry for the restore action
    await this.prisma.pageVersion.create({
      data: {
        pageId: id,
        blocks: version.blocks,
        createdBy: user?.id,
      },
    });

    return updatedPage;
  }

  /**
   * Generate preview token for a page
   * Preview tokens allow viewing draft pages without authentication
   */
  async generatePreviewToken(
    id: string,
    user?: any,
  ): Promise<{ token: string; expiresAt: Date }> {
    const page = await this.findOne(id);

    // Check permissions
    if (user && ![UserRole.ADMIN, UserRole.EDITOR, UserRole.AUTHOR].includes(user.role)) {
      throw new ForbiddenException('权限不足');
    }

    // Generate a secure random token
    const token = crypto.randomBytes(32).toString('hex');

    // Token expires in 24 hours
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Store token in page metadata
    const currentMeta = (page.meta as any) || {};
    const previewTokens = currentMeta.previewTokens || [];

    // Add new token
    previewTokens.push({
      token,
      expiresAt: expiresAt.toISOString(),
      createdBy: user?.id,
      createdAt: new Date().toISOString(),
    });

    // Clean up expired tokens
    const validTokens = previewTokens.filter(
      (t: any) => new Date(t.expiresAt) > new Date(),
    );

    // Update page metadata
    await this.prisma.page.update({
      where: { id },
      data: {
        meta: {
          ...currentMeta,
          previewTokens: validTokens,
        },
      },
    });

    return { token, expiresAt };
  }

  /**
   * Get page by preview token
   */
  async getPageByPreviewToken(token: string): Promise<Page> {
    // Find page with this preview token
    const pages = await this.prisma.page.findMany();

    for (const page of pages) {
      const meta = (page.meta as any) || {};
      const previewTokens = meta.previewTokens || [];

      const tokenData = previewTokens.find(
        (t: any) => t.token === token && new Date(t.expiresAt) > new Date(),
      );

      if (tokenData) {
        return page;
      }
    }

    throw new NotFoundException('预览链接无效或已过期');
  }
}