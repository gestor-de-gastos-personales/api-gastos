import { PresupuestosService } from './presupuestos.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

const prismaMock = {
  usuario: { findFirst: vi.fn(), create: vi.fn() },
  presupuesto: { findMany: vi.fn(), upsert: vi.fn() },
};

const service = new PresupuestosService(prismaMock as unknown as PrismaService);

describe('PresupuestosService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('lista vacío para un telegramId desconocido', async () => {
    prismaMock.usuario.findFirst.mockResolvedValue(null);

    await expect(service.listar('999')).resolves.toEqual({ data: [], total: 0 });
  });

  it('hace upsert del presupuesto del mes', async () => {
    prismaMock.usuario.findFirst.mockResolvedValue({ id: 2 });
    prismaMock.presupuesto.upsert.mockResolvedValue({ id: 1 });

    await service.guardar({
      telegramId: '77',
      categoriaId: 1,
      monto: 5000,
      mes: 10,
      anio: 2026,
    });

    expect(prismaMock.presupuesto.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          usuarioId_categoriaId_mes_anio: {
            usuarioId: 2,
            categoriaId: 1,
            mes: 10,
            anio: 2026,
          },
        },
      }),
    );
  });
});
