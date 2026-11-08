import { NotFoundException } from '@nestjs/common';
import { GruposService } from './grupos.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

const prismaMock = {
  usuario: { findFirst: vi.fn(), create: vi.fn() },
  grupo: { findMany: vi.fn(), create: vi.fn(), findUnique: vi.fn() },
  grupoMiembro: { upsert: vi.fn() },
};

const service = new GruposService(prismaMock as unknown as PrismaService);

describe('GruposService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('crea el grupo con código de invitación y owner', async () => {
    prismaMock.usuario.findFirst.mockResolvedValue({ id: 3 });
    prismaMock.grupo.create.mockResolvedValue({ id: 1 });

    await service.crear({ telegramId: '10', nombre: 'Casa' });

    const argumento = prismaMock.grupo.create.mock.calls[0][0];
    expect(argumento.data.nombre).toBe('Casa');
    expect(argumento.data.codigoInvitacion).toMatch(/^[A-Za-z0-9_-]{8}$/);
    expect(argumento.data.miembros.create).toEqual({ usuarioId: 3, rol: 'owner' });
  });

  it('rechaza un código de invitación inexistente', async () => {
    prismaMock.grupo.findUnique.mockResolvedValue(null);

    await expect(
      service.unirse({ telegramId: '10', codigoInvitacion: 'NOEXISTE' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('agrega al usuario como miembro del grupo', async () => {
    prismaMock.grupo.findUnique
      .mockResolvedValueOnce({ id: 5 })
      .mockResolvedValueOnce({ id: 5, miembros: [] });
    prismaMock.usuario.findFirst.mockResolvedValue({ id: 3 });

    await service.unirse({ telegramId: '10', codigoInvitacion: 'ABC123' });

    expect(prismaMock.grupoMiembro.upsert).toHaveBeenCalledWith({
      where: { grupoId_usuarioId: { grupoId: 5, usuarioId: 3 } },
      update: {},
      create: { grupoId: 5, usuarioId: 3, rol: 'miembro' },
    });
  });
});
