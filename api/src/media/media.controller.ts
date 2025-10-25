import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { extname, join } from 'path';
import { existsSync, mkdirSync, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { User } from '../common/decorators/user.decorator';
import { UserRole } from '@prisma/client';
import { CreateMediaDto, UpdateMediaDto } from './dto/media.dto';

@ApiTags('媒体管理')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '上传媒体文件' })
  @ApiResponse({ status: 201, description: '上传成功' })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 400, description: '文件格式或大小无效' })
  @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.AUTHOR)
  @UseGuards(JwtAuthGuard)
  async upload(@Req() req: any, @User() user: any) {
    try {
      // Get the uploaded file from Fastify multipart
      const data = await req.file();

      if (!data) {
        throw new BadRequestException('请选择要上传的文件');
      }

      // Create uploads directory if it doesn't exist
      const uploadPath = join(process.cwd(), 'uploads');
      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath, { recursive: true });
      }

      // Generate unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(data.filename);
      const filename = `${uniqueSuffix}${ext}`;
      const filepath = join(uploadPath, filename);

      // Save file to disk
      await pipeline(data.file, createWriteStream(filepath));

      // Get file stats
      const fs = require('fs');
      const stats = fs.statSync(filepath);

      // 根据 MIME 类型推断媒体类型
      let type = 'other';
      if (data.mimetype.startsWith('image/')) {
        type = 'image';
      } else if (data.mimetype.startsWith('video/')) {
        type = 'video';
      } else if (data.mimetype.startsWith('audio/')) {
        type = 'audio';
      } else if (
        data.mimetype.includes('pdf') ||
        data.mimetype.includes('document') ||
        data.mimetype.includes('text') ||
        data.mimetype.includes('msword') ||
        data.mimetype.includes('officedocument')
      ) {
        type = 'document';
      }

      const createMediaDto = {
        filename: filename,
        type: type as any,
        mimeType: data.mimetype,
        size: stats.size,
        path: filepath,
        altText: '',
        metadata: {},
      };

      console.log('[Upload] Creating media record:', createMediaDto);
      console.log('[Upload] User:', user);

      const media = await this.mediaService.createMedia(createMediaDto, user);

      console.log('[Upload] Media created:', media);

      return {
        success: true,
        message: '文件上传成功',
        data: media,
      };
    } catch (error) {
      console.error('[Upload] Error:', error);
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.AUTHOR)
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建媒体记录' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 400, description: '数据无效' })
  async create(@Body() createMediaDto: CreateMediaDto, @User() user: any) {
    try {
      const media = await this.mediaService.createMedia(createMediaDto, user);
      return {
        success: true,
        message: '媒体记录创建成功',
        data: media,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '获取媒体文件列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(@Query() query: any) {
    try {
      const media = await this.mediaService.findAll(query);
      return {
        success: true,
        data: media,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '获取单个媒体文件' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '媒体文件未找到' })
  async findOne(@Param('id') id: string) {
    try {
      const media = await this.mediaService.findOne(id);
      return {
        success: true,
        data: media,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '更新媒体文件信息' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 404, description: '媒体文件未找到' })
  async update(
    @Param('id') id: string,
    @Body() updateMediaDto: UpdateMediaDto,
    @User() user: any,
  ) {
    try {
      const media = await this.mediaService.update(id, updateMediaDto, user);
      return {
        success: true,
        message: '媒体文件更新成功',
        data: media,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '删除媒体文件' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 404, description: '媒体文件未找到' })
  async remove(@Param('id') id: string, @User() user: any) {
    try {
      const media = await this.mediaService.remove(id, user);
      return {
        success: true,
        message: '媒体文件删除成功',
        data: media,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }
}