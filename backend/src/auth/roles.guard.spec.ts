import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from './guards/role.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesGuard, Reflector],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  function createMockContext(role: string | null, requiredRoles: string[] | null): ExecutionContext {
    const mockReflector = jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles as any);
    const ctx = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: role ? { id: 'user-1', role } : null,
        }),
      }),
    } as any;
    return ctx;
  }

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access when no roles are required', () => {
    const ctx = createMockContext('ADMIN', null);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should allow access when user has required role', () => {
    const ctx = createMockContext('ADMIN', ['ADMIN']);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should deny access when user does not have required role', () => {
    const ctx = createMockContext('GURU', ['TIM_DAPUR']);
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('should deny access when user is null', () => {
    const ctx = createMockContext(null, ['ADMIN']);
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('should allow access for multiple allowed roles when user matches one', () => {
    const ctx = createMockContext('TIM_DAPUR', ['ADMIN', 'TIM_DAPUR']);
    expect(guard.canActivate(ctx)).toBe(true);
  });
});
