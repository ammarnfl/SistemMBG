import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: Partial<PrismaService>;
  let jwtService: Partial<JwtService>;

  const mockUser = {
    id: 'user-id-123',
    email: 'test@example.com',
    password: '$2a$10$hashedpassword', // bcrypt hash placeholder
    name: 'Test User',
    role: 'ADMIN' as any,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    guruProfile: null,
    penerimaManfaatProfile: null,
    timDapurProfile: null,
    distribusiDibuat: [],
    distribusiDikonfirmasi: [],
    evaluasiHarian: [],
  };

  beforeEach(async () => {
    prismaService = {
      user: {
        findUnique: jest.fn(),
      } as any,
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should throw UnauthorizedException for non-existent user', async () => {
      (prismaService.user!.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.login({ email: 'nonexistent@example.com', password: 'any' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      (prismaService.user!.findUnique as jest.Mock).mockResolvedValue({ ...mockUser, isActive: false });
      await expect(service.login({ email: mockUser.email, password: 'Password123!' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      (prismaService.user!.findUnique as jest.Mock).mockResolvedValue(mockUser);
      // Wrong password — bcrypt.compare will return false
      await expect(service.login({ email: mockUser.email, password: 'wrongpassword' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should return accessToken on valid credentials', async () => {
      // Use a real bcrypt hash for 'Password123!'
      const bcrypt = require('bcryptjs');
      const hashedPw = await bcrypt.hash('Password123!', 10);
      (prismaService.user!.findUnique as jest.Mock).mockResolvedValue({ ...mockUser, password: hashedPw });

      const result = await service.login({ email: mockUser.email, password: 'Password123!' });
      expect(result).toHaveProperty('accessToken', 'mock-jwt-token');
      expect(result.user.email).toBe(mockUser.email);
    });
  });

  describe('getMe', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      (prismaService.user!.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.getMe('unknown-id')).rejects.toThrow(UnauthorizedException);
    });

    it('should return user without password', async () => {
      (prismaService.user!.findUnique as jest.Mock).mockResolvedValue({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        isActive: mockUser.isActive,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
      const result = await service.getMe(mockUser.id);
      expect(result.email).toBe(mockUser.email);
      expect(result).not.toHaveProperty('password');
    });
  });
});
