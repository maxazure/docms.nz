import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<UserRole[]>('roles', context.getHandler());

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('用户未登录');
    }

    const hasPermission = requiredRoles.some(role => {
      return this.checkRoleHierarchy(user.role, role);
    });

    if (!hasPermission) {
      throw new ForbiddenException('权限不足');
    }

    return true;
  }

  /**
   * Check role hierarchy: higher roles can access lower role resources
   */
  private checkRoleHierarchy(userRole: UserRole, requiredRole: UserRole): boolean {
    const roleHierarchy = {
      [UserRole.VIEWER]: 1,
      [UserRole.AUTHOR]: 2,
      [UserRole.EDITOR]: 3,
      [UserRole.ADMIN]: 4,
      [UserRole.OWNER]: 5,
    };

    const userLevel = roleHierarchy[userRole] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;

    return userLevel >= requiredLevel;
  }
}