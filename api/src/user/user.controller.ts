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
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { User as UserDecorator } from '../auth/decorators/user.decorator';
import { UserRole } from '@prisma/client';
import { CreateUserDto, UpdateUserDto, UserListQuery } from './dto/user.dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '获取用户列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(@Query() query: UserListQuery) {
    try {
      const result = await this.userService.findAll(query);
      return {
        success: true,
        data: result,
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
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '获取单个用户' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findOne(@Param('id') id: string) {
    try {
      const user = await this.userService.findOne(id);
      return {
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  @Post()
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建用户' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async create(@Body() createUserDto: CreateUserDto, @UserDecorator() currentUser: any) {
    try {
      const user = await this.userService.create(createUserDto, currentUser);
      return {
        success: true,
        message: '用户创建成功',
        data: user,
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
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '更新用户' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @UserDecorator() currentUser: any,
  ) {
    try {
      const user = await this.userService.update(id, updateUserDto, currentUser);
      return {
        success: true,
        message: '用户更新成功',
        data: user,
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
  @Roles(UserRole.OWNER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '删除用户' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async remove(@Param('id') id: string, @UserDecorator() currentUser: any) {
    try {
      await this.userService.remove(id, currentUser);
      return {
        success: true,
        message: '用户删除成功',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Post(':id/toggle-active')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '切换用户激活状态' })
  @ApiResponse({ status: 200, description: '切换成功' })
  async toggleActive(@Param('id') id: string) {
    try {
      const user = await this.userService.toggleActive(id);
      return {
        success: true,
        message: '用户状态更新成功',
        data: user,
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
