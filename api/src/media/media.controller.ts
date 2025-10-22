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
} from '@nestjs/common';
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

  @Post()
  @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.AUTHOR)
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '上传媒体文件' })
  @ApiResponse({ status: 201, description: '上传成功' })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 400, description: '文件格式或大小无效' })
  async create(@Body() createMediaDto: CreateMediaDto, @User() user: any) {
    try {
      const media = await this.mediaService.createMedia(createMediaDto, user);
      return {
        success: true,
        message: '媒体文件上传成功',
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