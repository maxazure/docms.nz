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
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { TagService } from './tag.service';
import { CreateTagDto, UpdateTagDto, TagQueryDto, TagResponseDto } from './dto/tag.dto';

@ApiTags('标签管理')
@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  /**
   * 创建新标签
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建新标签' })
  @ApiResponse({ status: 201, description: '创建成功', type: TagResponseDto })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async create(@Body() createTagDto: CreateTagDto, @Request() req: any) {
    return this.tagService.create(createTagDto, req.user);
  }

  /**
   * 获取所有标签
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '获取所有标签' })
  @ApiResponse({ status: 200, description: '获取成功', type: [TagResponseDto] })
  async findAll(@Query() query: TagQueryDto) {
    return this.tagService.findAll(query);
  }

  /**
   * 根据ID获取标签
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '根据ID获取标签' })
  @ApiParam({ name: 'id', description: '标签ID' })
  @ApiResponse({ status: 200, description: '获取成功', type: TagResponseDto })
  @ApiResponse({ status: 404, description: '标签不存在' })
  async findOne(@Param('id') id: string) {
    return this.tagService.findOne(id);
  }

  /**
   * 更新标签
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '更新标签' })
  @ApiParam({ name: 'id', description: '标签ID' })
  @ApiResponse({ status: 200, description: '更新成功', type: TagResponseDto })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 404, description: '标签不存在' })
  async update(
    @Param('id') id: string,
    @Body() updateTagDto: UpdateTagDto,
    @Request() req: any,
  ) {
    return this.tagService.update(id, updateTagDto, req.user);
  }

  /**
   * 删除标签
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '删除标签' })
  @ApiParam({ name: 'id', description: '标签ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 404, description: '标签不存在' })
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.tagService.remove(id, req.user);
  }
}
