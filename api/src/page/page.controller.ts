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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { PageService } from './page.service';
import { CreatePageDto, UpdatePageDto, PageQueryDto, PageResponseDto } from './dto/page.dto';

@ApiTags('页面管理')
@Controller('pages')
export class PageController {
  constructor(private readonly pageService: PageService) {}

  /**
   * 创建新页面
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.AUTHOR)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建新页面' })
  @ApiResponse({ status: 201, description: '创建成功', type: PageResponseDto })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async create(@Body() createPageDto: CreatePageDto, @Request() req: any) {
    return this.pageService.create(createPageDto, req.user);
  }

  /**
   * 获取所有页面(分页)
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '获取所有页面(分页)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: '页码' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: '每页数量' })
  @ApiQuery({ name: 'search', required: false, type: String, description: '搜索关键词' })
  @ApiQuery({ name: 'status', required: false, enum: ['DRAFT', 'PUBLISHED'], description: '页面状态' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(@Query() query: PageQueryDto) {
    return this.pageService.findAll(query);
  }

  /**
   * 根据ID获取页面
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '根据ID获取页面' })
  @ApiParam({ name: 'id', description: '页面ID' })
  @ApiResponse({ status: 200, description: '获取成功', type: PageResponseDto })
  @ApiResponse({ status: 404, description: '页面不存在' })
  async findOne(@Param('id') id: string) {
    return this.pageService.findOne(id);
  }

  /**
   * 根据slug获取页面
   */
  @Get('by-slug/:slug')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '根据URL路径获取页面' })
  @ApiParam({ name: 'slug', description: '页面URL路径' })
  @ApiResponse({ status: 200, description: '获取成功', type: PageResponseDto })
  @ApiResponse({ status: 404, description: '页面不存在' })
  async getBySlug(@Param('slug') slug: string) {
    return this.pageService.getPageBySlug(slug);
  }

  /**
   * 更新页面
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '更新页面' })
  @ApiParam({ name: 'id', description: '页面ID' })
  @ApiResponse({ status: 200, description: '更新成功', type: PageResponseDto })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 404, description: '页面不存在' })
  async update(
    @Param('id') id: string,
    @Body() updatePageDto: UpdatePageDto,
    @Request() req: any,
  ) {
    return this.pageService.update(id, updatePageDto, req.user);
  }

  /**
   * 删除页面
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '删除页面' })
  @ApiParam({ name: 'id', description: '页面ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 404, description: '页面不存在' })
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.pageService.remove(id, req.user);
  }

  /**
   * 发布页面
   */
  @Post(':id/publish')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '发布页面' })
  @ApiParam({ name: 'id', description: '页面ID' })
  @ApiResponse({ status: 200, description: '发布成功', type: PageResponseDto })
  @ApiResponse({ status: 400, description: '页面已发布' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '只有管理员可以发布页面' })
  @ApiResponse({ status: 404, description: '页面不存在' })
  async publish(@Param('id') id: string, @Request() req: any) {
    return this.pageService.publish(id, req.user);
  }

  /**
   * 复制页面
   */
  @Post(':id/duplicate')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '复制页面' })
  @ApiParam({ name: 'id', description: '页面ID' })
  @ApiResponse({ status: 201, description: '复制成功', type: PageResponseDto })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 404, description: '页面不存在' })
  async duplicate(@Param('id') id: string, @Request() req: any) {
    return this.pageService.duplicate(id, req.user);
  }

  /**
   * 调整页面区块顺序
   */
  @Put(':id/blocks/reorder')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.AUTHOR)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '调整页面区块顺序' })
  @ApiParam({ name: 'id', description: '页面ID' })
  @ApiResponse({ status: 200, description: '调整成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 404, description: '页面不存在' })
  async reorderBlocks(
    @Param('id') id: string,
    @Body() body: { blockIds: string[] },
    @Request() req: any,
  ) {
    return this.pageService.reorderBlocks(id, body.blockIds, req.user);
  }

  /**
   * 添加区块到页面
   */
  @Post(':id/blocks')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.AUTHOR)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '添加区块到页面' })
  @ApiParam({ name: 'id', description: '页面ID' })
  @ApiResponse({ status: 201, description: '添加成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 404, description: '页面不存在' })
  async addBlock(
    @Param('id') id: string,
    @Body() body: { type: string; props?: any; order?: number },
    @Request() req: any,
  ) {
    return this.pageService.addBlock(id, body, req.user);
  }

  /**
   * 更新页面中的区块
   */
  @Put(':id/blocks/:blockId')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.AUTHOR)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '更新页面中的区块' })
  @ApiParam({ name: 'id', description: '页面ID' })
  @ApiParam({ name: 'blockId', description: '区块ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 404, description: '页面或区块不存在' })
  async updateBlock(
    @Param('id') id: string,
    @Param('blockId') blockId: string,
    @Body() body: { props?: any; visibility?: boolean },
    @Request() req: any,
  ) {
    return this.pageService.updateBlock(id, blockId, body, req.user);
  }

  /**
   * 删除页面中的区块
   */
  @Delete(':id/blocks/:blockId')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.AUTHOR)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '删除页面中的区块' })
  @ApiParam({ name: 'id', description: '页面ID' })
  @ApiParam({ name: 'blockId', description: '区块ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 404, description: '页面或区块不存在' })
  async removeBlock(
    @Param('id') id: string,
    @Param('blockId') blockId: string,
    @Request() req: any,
  ) {
    return this.pageService.removeBlock(id, blockId, req.user);
  }

  /**
   * 获取页面的版本历史
   */
  @Get(':id/versions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '获取页面的版本历史' })
  @ApiParam({ name: 'id', description: '页面ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 404, description: '页面不存在' })
  async getVersions(@Param('id') id: string) {
    return this.pageService.getVersions(id);
  }

  /**
   * 回滚到指定版本
   */
  @Post(':id/versions/:versionId/restore')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '回滚到指定版本' })
  @ApiParam({ name: 'id', description: '页面ID' })
  @ApiParam({ name: 'versionId', description: '版本ID' })
  @ApiResponse({ status: 200, description: '回滚成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 404, description: '页面或版本不存在' })
  async restoreVersion(
    @Param('id') id: string,
    @Param('versionId') versionId: string,
    @Request() req: any,
  ) {
    return this.pageService.restoreVersion(id, versionId, req.user);
  }

  /**
   * 生成页面预览令牌
   */
  @Post(':id/preview/token')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.AUTHOR)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '生成页面预览令牌' })
  @ApiParam({ name: 'id', description: '页面ID' })
  @ApiResponse({ status: 200, description: '生成成功', schema: { properties: { token: { type: 'string' }, expiresAt: { type: 'string' } } } })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 404, description: '页面不存在' })
  async generatePreviewToken(@Param('id') id: string, @Request() req: any) {
    return this.pageService.generatePreviewToken(id, req.user);
  }

  /**
   * 使用预览令牌访问页面
   */
  @Get('preview/:token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '使用预览令牌访问页面' })
  @ApiParam({ name: 'token', description: '预览令牌' })
  @ApiResponse({ status: 200, description: '获取成功', type: PageResponseDto })
  @ApiResponse({ status: 404, description: '页面不存在或令牌无效' })
  async getPageByPreviewToken(@Param('token') token: string) {
    return this.pageService.getPageByPreviewToken(token);
  }
}
