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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MenuService, MenuTreeNode } from './menu.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { User } from '../common/decorators/user.decorator';
import { UserRole } from '@prisma/client';
import { CreateMenuItemDto, UpdateMenuItemDto } from './dto/menu.dto';

@ApiTags('菜单管理')
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.AUTHOR)
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建菜单项' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async create(@Body() createMenuItemDto: CreateMenuItemDto, @User() user: any) {
    try {
      const menuItem = await this.menuService.create(createMenuItemDto, user);
      return {
        success: true,
        message: '菜单项创建成功',
        data: menuItem,
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
  @ApiOperation({ summary: '获取菜单列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(@Query() query: any) {
    try {
      const menuItems = await this.menuService.findAll(query);
      return {
        success: true,
        data: menuItems,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  @Get('tree')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '获取树形菜单结构' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getMenuTree(@Query() query: any): Promise<{ success: boolean; data: MenuTreeNode[] | null; message?: string }> {
    try {
      const menuTree = await this.menuService.getMenuTree(query);
      return {
        success: true,
        data: menuTree,
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
  @ApiOperation({ summary: '获取单个菜单项' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '菜单项未找到' })
  async findOne(@Param('id') id: string) {
    try {
      const menuItem = await this.menuService.findOne(id);
      return {
        success: true,
        data: menuItem,
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
  @ApiOperation({ summary: '更新菜单项' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 404, description: '菜单项未找到' })
  async update(
    @Param('id') id: string,
    @Body() updateMenuItemDto: UpdateMenuItemDto,
    @User() user: any,
  ) {
    try {
      const menuItem = await this.menuService.update(id, updateMenuItemDto, user);
      return {
        success: true,
        message: '菜单项更新成功',
        data: menuItem,
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
  @ApiOperation({ summary: '删除菜单项' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 404, description: '菜单项未找到' })
  async remove(@Param('id') id: string, @User() user: any) {
    try {
      const menuItem = await this.menuService.remove(id, user);
      return {
        success: true,
        message: '菜单项删除成功',
        data: menuItem,
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