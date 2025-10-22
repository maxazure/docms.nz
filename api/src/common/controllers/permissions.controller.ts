import {
  Controller,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PermissionsService } from '../services/permissions.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Permissions')
@Controller('permissions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '获取所有角色信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '未授权访问' })
  getAllRoles() {
    return {
      success: true,
      data: this.permissionsService.getRolesWithLevels(),
    };
  }

  @Get('hierarchy')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '获取角色层次结构' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '未授权访问' })
  getRoleHierarchy() {
    return {
      success: true,
      data: {
        hierarchy: [
          { role: UserRole.VIEWER, level: 1, description: '访客' },
          { role: UserRole.AUTHOR, level: 2, description: '作者' },
          { role: UserRole.EDITOR, level: 3, description: '编辑' },
          { role: UserRole.ADMIN, level: 4, description: '管理员' },
          { role: UserRole.OWNER, level: 5, description: '所有者' },
        ],
        rules: {
          VIEWER: {
            canView: true,
            canCreateContent: false,
            canEditOwnContent: false,
            canEditAllContent: false,
            canPublish: false,
            canDelete: false,
            canManageUsers: false,
            canManageSite: false,
            canManageSystem: false,
          },
          AUTHOR: {
            canView: true,
            canCreateContent: true,
            canEditOwnContent: true,
            canEditAllContent: false,
            canPublish: false,
            canDeleteOwnContent: true,
            canManageUsers: false,
            canManageSite: false,
            canManageSystem: false,
          },
          EDITOR: {
            canView: true,
            canCreateContent: true,
            canEditOwnContent: true,
            canEditAllContent: true,
            canPublish: true,
            canDelete: true,
            canManageUsers: false,
            canManageSite: false,
            canManageSystem: false,
          },
          ADMIN: {
            canView: true,
            canCreateContent: true,
            canEditOwnContent: true,
            canEditAllContent: true,
            canPublish: true,
            canDelete: true,
            canManageUsers: true,
            canManageSite: true,
            canManageSystem: false,
          },
          OWNER: {
            canView: true,
            canCreateContent: true,
            canEditOwnContent: true,
            canEditAllContent: true,
            canPublish: true,
            canDelete: true,
            canManageUsers: true,
            canManageSite: true,
            canManageSystem: true,
          },
        },
      },
    };
  }

  @Get('check/:role')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '检查特定角色权限' })
  @ApiResponse({ status: 200, description: '检查成功' })
  @ApiResponse({ status: 401, description: '未授权访问' })
  checkRolePermissions() {
    return {
      success: true,
      data: {
        message: '使用 GET /api/permissions/check/{role}?userRole={userRole} 来检查特定权限',
        examples: [
          {
            userRole: 'EDITOR',
            canManageUsers: false,
            canPublishContent: true,
            canEditAllContent: true,
          },
        ],
      },
    };
  }
}