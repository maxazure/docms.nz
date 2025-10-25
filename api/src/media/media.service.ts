import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { Media, UserRole } from '@prisma/client';
import { CreateMediaDto, UpdateMediaDto, MediaType } from './dto/media.dto';

@Injectable()
export class MediaService {
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  constructor(private prisma: PrismaService) {}

  /**
   * Create new media record
   */
  async createMedia(createMediaDto: CreateMediaDto, user?: any): Promise<Media> {
    // Check permissions - only OWNER, ADMIN, EDITOR, and AUTHOR can upload media
    if (user && ![UserRole.OWNER, UserRole.ADMIN, UserRole.EDITOR, UserRole.AUTHOR].includes(user.role)) {
      throw new ForbiddenException('权限不足');
    }

    // Validate file size
    if (createMediaDto.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException('文件大小超过限制');
    }

    // Map DTO to Prisma model
    const mediaData = {
      filename: createMediaDto.filename,
      originalName: createMediaDto.filename, // Use same as filename for now
      mime: createMediaDto.mimeType,
      size: createMediaDto.size,
      storageKey: createMediaDto.path,
      alt: createMediaDto.altText,
      meta: createMediaDto.metadata,
      width: createMediaDto.metadata?.width,
      height: createMediaDto.metadata?.height,
    };

    const media = await this.prisma.media.create({
      data: mediaData,
    });

    return media;
  }

  /**
   * Get all media with pagination and filtering
   */
  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{
    data: Media[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, search } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { filename: { contains: search, mode: 'insensitive' } },
        { originalName: { contains: search, mode: 'insensitive' } },
        { alt: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [media, total] = await Promise.all([
      this.prisma.media.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.media.count({ where }),
    ]);

    return {
      data: media,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get media by ID
   */
  async findOne(id: string): Promise<Media> {
    const media = await this.prisma.media.findUnique({
      where: { id },
    });

    if (!media) {
      throw new NotFoundException('媒体文件未找到');
    }

    return media;
  }

  /**
   * Update media metadata
   */
  async update(id: string, updateMediaDto: UpdateMediaDto, user?: any): Promise<Media> {
    const existingMedia = await this.findOne(id);

    // Check permissions - only OWNER, ADMIN and EDITOR can update media metadata
    if (user && ![UserRole.OWNER, UserRole.ADMIN, UserRole.EDITOR].includes(user.role)) {
      throw new ForbiddenException('权限不足');
    }

    // Map DTO to Prisma model
    const updateData: any = {};
    if (updateMediaDto.description !== undefined) {
      // Store description in meta since there's no description field
      updateData.meta = {
        ...(existingMedia.meta as any || {}),
        description: updateMediaDto.description,
      };
    }
    if (updateMediaDto.altText !== undefined) {
      updateData.alt = updateMediaDto.altText;
    }
    if (updateMediaDto.metadata) {
      updateData.meta = {
        ...(existingMedia.meta as any || {}),
        ...updateMediaDto.metadata,
      };
      updateData.width = updateMediaDto.metadata.width;
      updateData.height = updateMediaDto.metadata.height;
    }

    const updatedMedia = await this.prisma.media.update({
      where: { id },
      data: updateData,
    });

    return updatedMedia;
  }

  /**
   * Delete media
   */
  async remove(id: string, user?: any): Promise<Media> {
    const existingMedia = await this.findOne(id);

    // Check permissions - only OWNER, ADMIN and EDITOR can delete media
    if (user && ![UserRole.OWNER, UserRole.ADMIN, UserRole.EDITOR].includes(user.role)) {
      throw new ForbiddenException('权限不足');
    }

    const deletedMedia = await this.prisma.media.delete({
      where: { id },
    });

    return deletedMedia;
  }

  }