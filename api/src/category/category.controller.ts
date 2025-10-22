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
import { CategoryService } from './category.service';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryQueryDto,
  CategoryResponseDto,
} from './dto/category.dto';

@ApiTags('分类管理')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  /**
   * 创建新分类
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建新分类' })
  @ApiResponse({ status: 201, description: '创建成功', type: CategoryResponseDto })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async create(@Body() createCategoryDto: CreateCategoryDto, @Request() req: any) {
    return this.categoryService.create(createCategoryDto, req.user);
  }

  /**
   * 获取所有分类
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '获取所有分类' })
  @ApiResponse({ status: 200, description: '获取成功', type: [CategoryResponseDto] })
  async findAll(@Query() query: CategoryQueryDto) {
    return this.categoryService.findAll(query);
  }

  /**
   * 获取分类树结构
   */
  @Get('tree')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '获取分类树结构' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getTree() {
    return this.categoryService.getTree();
  }

  /**
   * 根据ID获取分类
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '根据ID获取分类' })
  @ApiParam({ name: 'id', description: '分类ID' })
  @ApiResponse({ status: 200, description: '获取成功', type: CategoryResponseDto })
  @ApiResponse({ status: 404, description: '分类不存在' })
  async findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  /**
   * 更新分类
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '更新分类' })
  @ApiParam({ name: 'id', description: '分类ID' })
  @ApiResponse({ status: 200, description: '更新成功', type: CategoryResponseDto })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 404, description: '分类不存在' })
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Request() req: any,
  ) {
    return this.categoryService.update(id, updateCategoryDto, req.user);
  }

  /**
   * 删除分类
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '删除分类' })
  @ApiParam({ name: 'id', description: '分类ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 400, description: '该分类下有子分类，无法删除' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 404, description: '分类不存在' })
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.categoryService.remove(id, req.user);
  }

  /**
   * 切换分类激活状态
   */
  @Post(':id/toggle')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '切换分类激活状态' })
  @ApiParam({ name: 'id', description: '分类ID' })
  @ApiResponse({ status: 200, description: '切换成功', type: CategoryResponseDto })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 404, description: '分类不存在' })
  async toggleActive(@Param('id') id: string, @Request() req: any) {
    return this.categoryService.toggleActive(id, req.user);
  }
}
