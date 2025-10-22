import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

/**
 * Roles decorator to specify required roles for a route
 * @param roles - Array of roles that can access the route
 */
export function Roles(...roles: UserRole[]) {
  return SetMetadata('roles', roles);
}