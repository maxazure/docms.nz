import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsService } from './permissions.service';
import { UserRole } from '@prisma/client';

describe('PermissionsService', () => {
  let permissionsService: PermissionsService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [PermissionsService],
    }).compile();

    permissionsService = app.get<PermissionsService>(PermissionsService);
  });

  describe('hasPermission', () => {
    it('should return true when user has higher or equal role', () => {
      const testCases = [
        {
          userRole: UserRole.OWNER,
          requiredRole: UserRole.VIEWER,
          expected: true,
        },
        {
          userRole: UserRole.OWNER,
          requiredRole: UserRole.AUTHOR,
          expected: true,
        },
        {
          userRole: UserRole.OWNER,
          requiredRole: UserRole.EDITOR,
          expected: true,
        },
        {
          userRole: UserRole.OWNER,
          requiredRole: UserRole.ADMIN,
          expected: true,
        },
        {
          userRole: UserRole.OWNER,
          requiredRole: UserRole.OWNER,
          expected: true,
        },
        {
          userRole: UserRole.ADMIN,
          requiredRole: UserRole.VIEWER,
          expected: true,
        },
        {
          userRole: UserRole.ADMIN,
          requiredRole: UserRole.AUTHOR,
          expected: true,
        },
        {
          userRole: UserRole.ADMIN,
          requiredRole: UserRole.EDITOR,
          expected: true,
        },
        {
          userRole: UserRole.ADMIN,
          requiredRole: UserRole.ADMIN,
          expected: true,
        },
        {
          userRole: UserRole.EDITOR,
          requiredRole: UserRole.VIEWER,
          expected: true,
        },
        {
          userRole: UserRole.EDITOR,
          requiredRole: UserRole.AUTHOR,
          expected: true,
        },
        {
          userRole: UserRole.EDITOR,
          requiredRole: UserRole.EDITOR,
          expected: true,
        },
        {
          userRole: UserRole.AUTHOR,
          requiredRole: UserRole.VIEWER,
          expected: true,
        },
        {
          userRole: UserRole.AUTHOR,
          requiredRole: UserRole.AUTHOR,
          expected: true,
        },
        {
          userRole: UserRole.VIEWER,
          requiredRole: UserRole.VIEWER,
          expected: true,
        },
      ];

      for (const testCase of testCases) {
        const result = permissionsService.hasPermission(testCase.userRole, testCase.requiredRole);
        expect(result).toBe(testCase.expected);
      }
    });

    it('should return false when user has lower role', () => {
      const testCases = [
        {
          userRole: UserRole.VIEWER,
          requiredRole: UserRole.AUTHOR,
          expected: false,
        },
        {
          userRole: UserRole.VIEWER,
          requiredRole: UserRole.EDITOR,
          expected: false,
        },
        {
          userRole: UserRole.VIEWER,
          requiredRole: UserRole.ADMIN,
          expected: false,
        },
        {
          userRole: UserRole.VIEWER,
          requiredRole: UserRole.OWNER,
          expected: false,
        },
        {
          userRole: UserRole.AUTHOR,
          requiredRole: UserRole.EDITOR,
          expected: false,
        },
        {
          userRole: UserRole.AUTHOR,
          requiredRole: UserRole.ADMIN,
          expected: false,
        },
        {
          userRole: UserRole.AUTHOR,
          requiredRole: UserRole.OWNER,
          expected: false,
        },
        {
          userRole: UserRole.EDITOR,
          requiredRole: UserRole.ADMIN,
          expected: false,
        },
        {
          userRole: UserRole.EDITOR,
          requiredRole: UserRole.OWNER,
          expected: false,
        },
        {
          userRole: UserRole.ADMIN,
          requiredRole: UserRole.OWNER,
          expected: false,
        },
      ];

      for (const testCase of testCases) {
        const result = permissionsService.hasPermission(testCase.userRole, testCase.requiredRole);
        expect(result).toBe(testCase.expected);
      }
    });
  });

  describe('hasAnyRole', () => {
    it('should return true when user has any of the required roles', () => {
      const testCases = [
        {
          userRole: UserRole.EDITOR,
          requiredRoles: [UserRole.ADMIN, UserRole.EDITOR],
          expected: true,
        },
        {
          userRole: UserRole.OWNER,
          requiredRoles: [UserRole.ADMIN, UserRole.OWNER],
          expected: true,
        },
        {
          userRole: UserRole.VIEWER,
          requiredRoles: [UserRole.VIEWER, UserRole.AUTHOR],
          expected: true,
        },
      ];

      for (const testCase of testCases) {
        const result = permissionsService.hasAnyRole(testCase.userRole, testCase.requiredRoles);
        expect(result).toBe(testCase.expected);
      }
    });

    it('should return false when user has none of the required roles', () => {
      const testCases = [
        {
          userRole: UserRole.VIEWER,
          requiredRoles: [UserRole.EDITOR, UserRole.ADMIN],
          expected: false,
        },
        {
          userRole: UserRole.AUTHOR,
          requiredRoles: [UserRole.ADMIN, UserRole.OWNER],
          expected: false,
        },
        {
          userRole: UserRole.EDITOR,
          requiredRoles: [UserRole.OWNER],
          expected: false,
        },
      ];

      for (const testCase of testCases) {
        const result = permissionsService.hasAnyRole(testCase.userRole, testCase.requiredRoles);
        expect(result).toBe(testCase.expected);
      }
    });

    it('should handle empty required roles array', () => {
      const result = permissionsService.hasAnyRole(UserRole.VIEWER, []);
      expect(result).toBe(true);
    });
  });

  describe('getRoleHierarchyLevel', () => {
    it('should return correct hierarchy levels', () => {
      const expectedLevels = {
        [UserRole.VIEWER]: 1,
        [UserRole.AUTHOR]: 2,
        [UserRole.EDITOR]: 3,
        [UserRole.ADMIN]: 4,
        [UserRole.OWNER]: 5,
      };

      for (const [role, expectedLevel] of Object.entries(expectedLevels)) {
        const result = permissionsService.getRoleHierarchyLevel(role as UserRole);
        expect(result).toBe(expectedLevel);
      }
    });
  });
});