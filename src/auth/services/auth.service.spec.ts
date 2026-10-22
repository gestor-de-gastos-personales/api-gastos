import {
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';

vi.mock('bcrypt', () => ({
  hash: vi.fn(async (password: string) => `hash:${password}`),
  compare: vi.fn(
    async (password: string, hash: string) => hash === `hash:${password}`,
  ),
}));

describe('AuthService', () => {
  let service: AuthService;

  const prismaMock = {
    usuario: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  };

  const jwtMock = {
    signAsync: vi.fn(),
  };

  beforeEach(async () => {
    vi.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: JwtService, useValue: jwtMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('hashea la contraseña y omite el hash en la respuesta', async () => {
      prismaMock.usuario.findUnique.mockResolvedValue(null);
      prismaMock.usuario.create.mockResolvedValue({
        id: 1,
        email: 'ana@mail.com',
        nombre: 'Ana',
        password: 'hash:secreto123',
      });

      const resultado = await service.register({
        email: 'ana@mail.com',
        password: 'secreto123',
        nombre: 'Ana',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('secreto123', 10);
      expect(prismaMock.usuario.create).toHaveBeenCalledWith({
        data: {
          email: 'ana@mail.com',
          password: 'hash:secreto123',
          nombre: 'Ana',
        },
      });
      expect(resultado).toEqual({
        id: 1,
        email: 'ana@mail.com',
        nombre: 'Ana',
      });
    });

    it('rechaza un email ya registrado', async () => {
      prismaMock.usuario.findUnique.mockResolvedValue({ id: 1 });

      await expect(
        service.register({
          email: 'ana@mail.com',
          password: 'secreto123',
          nombre: 'Ana',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(prismaMock.usuario.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('devuelve un access_token con credenciales válidas', async () => {
      prismaMock.usuario.findUnique.mockResolvedValue({
        id: 1,
        email: 'ana@mail.com',
        password: 'hash:secreto123',
      });
      jwtMock.signAsync.mockResolvedValue('jwt-firmado');

      const resultado = await service.login({
        email: 'ana@mail.com',
        password: 'secreto123',
      });

      expect(resultado).toEqual({ access_token: 'jwt-firmado' });
      expect(jwtMock.signAsync).toHaveBeenCalledWith({
        sub: 1,
        email: 'ana@mail.com',
      });
    });

    it('rechaza usuarios inexistentes', async () => {
      prismaMock.usuario.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nadie@mail.com', password: 'secreto123' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rechaza cuentas sin contraseña (solo Telegram)', async () => {
      prismaMock.usuario.findUnique.mockResolvedValue({
        id: 1,
        email: 'ana@mail.com',
        password: null,
      });

      await expect(
        service.login({ email: 'ana@mail.com', password: 'secreto123' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rechaza una contraseña incorrecta', async () => {
      prismaMock.usuario.findUnique.mockResolvedValue({
        id: 1,
        email: 'ana@mail.com',
        password: 'hash:secreto123',
      });

      await expect(
        service.login({ email: 'ana@mail.com', password: 'otra' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(jwtMock.signAsync).not.toHaveBeenCalled();
    });
  });

  describe('vincularTelegram', () => {
    it('vincula el telegramId a una cuenta web válida', async () => {
      prismaMock.usuario.findUnique.mockResolvedValue({
        id: 1,
        password: 'hash:secreto123',
      });
      prismaMock.usuario.findFirst.mockResolvedValue(null);
      prismaMock.usuario.update.mockResolvedValue({
        id: 1,
        email: 'ana@mail.com',
        password: 'hash:secreto123',
        telegramId: '555',
      });

      const resultado = await service.vincularTelegram({
        email: 'ana@mail.com',
        password: 'secreto123',
        telegramId: '555',
      });

      expect(prismaMock.usuario.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { telegramId: '555' },
      });
      expect(resultado).not.toHaveProperty('password');
    });

    it('rechaza credenciales inválidas', async () => {
      prismaMock.usuario.findUnique.mockResolvedValue({
        id: 1,
        password: 'hash:secreto123',
      });

      await expect(
        service.vincularTelegram({
          email: 'ana@mail.com',
          password: 'incorrecta',
          telegramId: '555',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rechaza un telegramId ya vinculado a otra cuenta', async () => {
      prismaMock.usuario.findUnique.mockResolvedValue({
        id: 1,
        password: 'hash:secreto123',
      });
      prismaMock.usuario.findFirst.mockResolvedValue({ id: 2 });

      await expect(
        service.vincularTelegram({
          email: 'ana@mail.com',
          password: 'secreto123',
          telegramId: '555',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(prismaMock.usuario.update).not.toHaveBeenCalled();
    });
  });

  describe('registerTelegram', () => {
    it('crea la cuenta con telegramId y nombre por defecto', async () => {
      prismaMock.usuario.findUnique.mockResolvedValue(null);
      prismaMock.usuario.findFirst.mockResolvedValue(null);
      prismaMock.usuario.create.mockResolvedValue({
        id: 2,
        email: 'bot@mail.com',
        password: 'hash:secreto123',
        telegramId: '777',
      });

      const resultado = await service.registerTelegram({
        email: 'bot@mail.com',
        password: 'secreto123',
        telegramId: '777',
      });

      expect(prismaMock.usuario.create).toHaveBeenCalledWith({
        data: {
          email: 'bot@mail.com',
          password: 'hash:secreto123',
          nombre: 'Usuario Telegram',
          telegramId: '777',
        },
      });
      expect(resultado).not.toHaveProperty('password');
    });

    it('rechaza un email ya registrado', async () => {
      prismaMock.usuario.findUnique.mockResolvedValue({ id: 1 });

      await expect(
        service.registerTelegram({
          email: 'bot@mail.com',
          password: 'secreto123',
          telegramId: '777',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('rechaza un telegramId ya vinculado', async () => {
      prismaMock.usuario.findUnique.mockResolvedValue(null);
      prismaMock.usuario.findFirst.mockResolvedValue({ id: 1 });

      await expect(
        service.registerTelegram({
          email: 'bot@mail.com',
          password: 'secreto123',
          telegramId: '777',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(prismaMock.usuario.create).not.toHaveBeenCalled();
    });
  });
});
