import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { UserRole } from '@prisma/client';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const mockReflector = {
      get: jest.fn(),
    };

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = app.get<RolesGuard>(RolesGuard);
    reflector = app.get<Reflector>(Reflector);
  });

  describe('canActivate', () => {
    it('should allow access if user has required role', async () => {
      const requiredRoles = [UserRole.OWNER, UserRole.ADMIN];
      const user = {
        id: 'user-1',
        email: 'admin@example.com',
        role: UserRole.OWNER,
      };

      (reflector.get as jest.Mock).mockReturnValue(requiredRoles);

      const mockExecutionContext = {
        getHandler: () => ({}),
        switchToHttp: () => ({
          getRequest: () => ({
            user,
          }),
        }),
      } as any;

      const result = await guard.canActivate(mockExecutionContext);
      expect(result).toBe(true);
    });

    it('should allow access if user has one of required roles', async () => {
      const requiredRoles = [UserRole.EDITOR, UserRole.ADMIN, UserRole.OWNER];
      const user = {
        id: 'user-1',
        email: 'editor@example.com',
        role: UserRole.EDITOR,
      };

      (reflector.get as jest.Mock).mockReturnValue(requiredRoles);

      const mockExecutionContext = {
        getHandler: () => ({}),
        switchToHttp: () => ({
          getRequest: () => ({
            user,
          }),
        }),
      } as any;

      const result = await guard.canActivate(mockExecutionContext);
      expect(result).toBe(true);
    });

    it('should throw ForbiddenException if user does not have required role', async () => {
      const requiredRoles = [UserRole.OWNER, UserRole.ADMIN];
      const user = {
        id: 'user-1',
        email: 'viewer@example.com',
        role: UserRole.VIEWER,
      };

      (reflector.get as jest.Mock).mockReturnValue(requiredRoles);

      const mockExecutionContext = {
        getHandler: () => ({}),
        switchToHttp: () => ({
          getRequest: () => ({
            user,
          }),
        }),
      } as any;

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        new ForbiddenException('权限不足'),
      );
    });

    it('should throw UnauthorizedException if no user is attached', async () => {
      const requiredRoles = [UserRole.OWNER];

      (reflector.get as jest.Mock).mockReturnValue(requiredRoles);

      const mockExecutionContext = {
        getHandler: () => ({}),
        switchToHttp: () => ({
          getRequest: () => ({}), // No user attached
        }),
      } as any;

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        new UnauthorizedException('用户未登录'),
      );
    });

    it('should allow access if no roles are required (public endpoint)', async () => {
      const user = {
        id: 'user-1',
        email: 'any@example.com',
        role: UserRole.VIEWER,
      };

      (reflector.get as jest.Mock).mockReturnValue([]); // No roles required

      const mockExecutionContext = {
        getHandler: () => ({}),
        switchToHttp: () => ({
          getRequest: () => ({
            user,
          }),
        }),
      } as any;

      const result = await guard.canActivate(mockExecutionContext);
      expect(result).toBe(true);
    });

    it('should allow access if roles metadata is not defined', async () => {
      const user = {
        id: 'user-1',
        email: 'any@example.com',
        role: UserRole.VIEWER,
      };

      (reflector.get as jest.Mock).mockReturnValue(undefined); // No metadata

      const mockExecutionContext = {
        getHandler: () => ({}),
        switchToHttp: () => ({
          getRequest: () => ({
            user,
          }),
        }),
      } as any;

      const result = await guard.canActivate(mockExecutionContext);
      expect(result).toBe(true);
    });
  });

  describe('Role hierarchy', () => {
    it('should respect role hierarchy: OWNER > ADMIN > EDITOR > AUTHOR > VIEWER', async () => {
      const testCases = [
        {
          requiredRole: UserRole.VIEWER,
          userRole: UserRole.VIEWER,
          shouldAllow: true,
        },
        {
          requiredRole: UserRole.VIEWER,
          userRole: UserRole.AUTHOR,
          shouldAllow: true,
        },
        {
          requiredRole: UserRole.VIEWER,
          userRole: UserRole.EDITOR,
          shouldAllow: true,
        },
        {
          requiredRole: UserRole.VIEWER,
          userRole: UserRole.ADMIN,
          shouldAllow: true,
        },
        {
          requiredRole: UserRole.VIEWER,
          userRole: UserRole.OWNER,
          shouldAllow: true,
        },
        {
          requiredRole: UserRole.AUTHOR,
          userRole: UserRole.VIEWER,
          shouldAllow: false,
        },
        {
          requiredRole: UserRole.AUTHOR,
          userRole: UserRole.AUTHOR,
          shouldAllow: true,
        },
        {
          requiredRole: UserRole.EDITOR,
          userRole: UserRole.AUTHOR,
          shouldAllow: false,
        },
        {
          requiredRole: UserRole.ADMIN,
          userRole: UserRole.EDITOR,
          shouldAllow: false,
        },
        {
          requiredRole: UserRole.OWNER,
          userRole: UserRole.ADMIN,
          shouldAllow: false,
        },
      ];

      for (const testCase of testCases) {
        const user = {
          id: 'user-1',
          email: 'test@example.com',
          role: testCase.userRole,
        };

        (reflector.get as jest.Mock).mockReturnValue([testCase.requiredRole]);

        const mockExecutionContext = {
          getHandler: () => ({}),
          switchToHttp: () => ({
            getRequest: () => ({
              user,
            }),
          }),
        } as any;

        const result = await guard.canActivate(mockExecutionContext);

        if (testCase.shouldAllow) {
          expect(result).toBe(true);
        } else {
          await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
            new ForbiddenException('权限不足'),
          );
        }
      }
    });
  });
});