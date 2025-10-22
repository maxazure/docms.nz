import { Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';

@Injectable()
export class PermissionsService {
  // Define role hierarchy levels
  private readonly ROLE_HIERARCHY = {
    [UserRole.VIEWER]: 1,
    [UserRole.AUTHOR]: 2,
    [UserRole.EDITOR]: 3,
    [UserRole.ADMIN]: 4,
    [UserRole.OWNER]: 5,
  };

  /**
   * Check if user has a specific role or higher role
   */
  hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
    const userLevel = this.getRoleHierarchyLevel(userRole);
    const requiredLevel = this.getRoleHierarchyLevel(requiredRole);
    return userLevel >= requiredLevel;
  }

  /**
   * Check if user has any of the required roles
   */
  hasAnyRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No specific roles required
    }

    return requiredRoles.some(requiredRole => this.hasPermission(userRole, requiredRole));
  }

  /**
   * Get hierarchy level for a role
   */
  getRoleHierarchyLevel(role: UserRole): number {
    return this.ROLE_HIERARCHY[role] || 0;
  }

  /**
   * Check if user can manage other users (requires ADMIN or OWNER)
   */
  canManageUsers(userRole: UserRole): boolean {
    return this.hasPermission(userRole, UserRole.ADMIN);
  }

  /**
   * Check if user can manage site settings (requires ADMIN or OWNER)
   */
  canManageSite(userRole: UserRole): boolean {
    return this.hasPermission(userRole, UserRole.ADMIN);
  }

  /**
   * Check if user can edit content (requires AUTHOR or higher)
   */
  canEditContent(userRole: UserRole): boolean {
    return this.hasPermission(userRole, UserRole.AUTHOR);
  }

  /**
   * Check if user can publish content (requires EDITOR or higher)
   */
  canPublishContent(userRole: UserRole): boolean {
    return this.hasPermission(userRole, UserRole.EDITOR);
  }

  /**
   * Check if user can delete content (requires EDITOR or higher)
   */
  canDeleteContent(userRole: UserRole): boolean {
    return this.hasPermission(userRole, UserRole.EDITOR);
  }

  /**
   * Check if user can manage all content (requires ADMIN or OWNER)
   */
  canManageAllContent(userRole: UserRole): boolean {
    return this.hasPermission(userRole, UserRole.ADMIN);
  }

  /**
   * Check if user can view analytics (requires ADMIN or OWNER)
   */
  canViewAnalytics(userRole: UserRole): boolean {
    return this.hasPermission(userRole, UserRole.ADMIN);
  }

  /**
   * Check if user can manage system settings (requires OWNER only)
   */
  canManageSystem(userRole: UserRole): boolean {
    return userRole === UserRole.OWNER;
  }

  /**
   * Get role descriptions for UI
   */
  getRoleDescriptions(): Record<UserRole, string> {
    return {
      [UserRole.VIEWER]: '访客 - 只能查看内容',
      [UserRole.AUTHOR]: '作者 - 可以创建和编辑自己的内容',
      [UserRole.EDITOR]: '编辑 - 可以编辑所有内容和发布',
      [UserRole.ADMIN]: '管理员 - 可以管理用户、内容和设置',
      [UserRole.OWNER]: '所有者 - 拥有所有权限',
    };
  }

  /**
   * Get all roles with their hierarchy levels
   */
  getRolesWithLevels(): Array<{ role: UserRole; level: number; description: string }> {
    const descriptions = this.getRoleDescriptions();

    return Object.entries(this.ROLE_HIERARCHY).map(([role, level]) => ({
      role: role as UserRole,
      level,
      description: descriptions[role as UserRole],
    })).sort((a, b) => b.level - a.level);
  }
}