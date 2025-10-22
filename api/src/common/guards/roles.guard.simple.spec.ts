import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { UserRole } from '@prisma/client';

describe('RolesGuard (Simple)', () => {
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

  it('should be defined', () => {
    expect(guard).toBeDefined();
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
        getHandler: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user,
          }),
        }),
      } as any;

      const result = await guard.canActivate(mockExecutionContext);
      expect(result).toBe(true);
    });

    it('should throw UnauthorizedException if no user is attached', async () => {
      const requiredRoles = [UserRole.OWNER];

      (reflector.get as jest.Mock).mockReturnValue(requiredRoles);

      const mockExecutionContext = {
        getHandler: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({}), // No user attached
        }),
      } as any;

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
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
        getHandler: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user,
          }),
        }),
      } as any;

      const result = await guard.canActivate(mockExecutionContext);
      expect(result).toBe(true);
    });
  });
});