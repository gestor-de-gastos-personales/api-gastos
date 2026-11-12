import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GastosSerieService } from './gastos-serie.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { UsuariosGastosService } from './usuarios-gastos.service.js';

describe('GastosSerieService', () => {
  let service: GastosSerieService;

  const prismaMock = {
    gasto: { findMany: vi.fn() },
  };
  const usuariosMock = {
    obtenerOCrearUsuarioId: vi.fn(),
  };

  beforeEach(async () => {
    vi.resetAllMocks();
    usuariosMock.obtenerOCrearUsuarioId.mockResolvedValue(7);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GastosSerieService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: UsuariosGastosService, useValue: usuariosMock },
      ],
    }).compile();

    service = module.get<GastosSerieService>(GastosSerieService);
  });

  it('agrupa por día y completa los días sin gastos', async () => {
    prismaMock.gasto.findMany.mockResolvedValue([
      { fecha: new Date('2026-11-01T12:00:00Z'), monto: '1500' },
      { fecha: new Date('2026-11-03T09:30:00Z'), monto: 500 },
    ]);

    const serie = await service.getSerie(7, {
      desde: '2026-11-01',
      hasta: '2026-11-03',
      agrupacion: 'dia',
    });

    expect(usuariosMock.obtenerOCrearUsuarioId).toHaveBeenCalledWith(7);
    expect(serie.agrupacion).toBe('dia');
    expect(serie.puntos).toEqual([
      { clave: '2026-11-01', etiqueta: '01/11', total: 1500 },
      { clave: '2026-11-02', etiqueta: '02/11', total: 0 },
      { clave: '2026-11-03', etiqueta: '03/11', total: 500 },
    ]);
    expect(serie.totalGeneral).toBe(2000);
    expect(prismaMock.gasto.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          usuarioId: 7,
          fecha: {
            gte: new Date('2026-11-01T00:00:00.000Z'),
            lte: new Date('2026-11-03T23:59:59.999Z'),
          },
        }),
        select: { fecha: true, monto: true },
      }),
    );
  });

  it('agrupa por mes con etiquetas MM/AAAA', async () => {
    prismaMock.gasto.findMany.mockResolvedValue([
      { fecha: new Date('2026-01-20T12:00:00Z'), monto: 100 },
      { fecha: new Date('2026-03-05T12:00:00Z'), monto: 250 },
    ]);

    const serie = await service.getSerie(7, {
      desde: '2026-01-15',
      hasta: '2026-03-10',
      agrupacion: 'mes',
    });

    expect(serie.puntos.map((p) => p.etiqueta)).toEqual([
      '01/2026',
      '02/2026',
      '03/2026',
    ]);
    expect(serie.puntos.map((p) => p.total)).toEqual([100, 0, 250]);
  });

  it('agrupa por semana desde el lunes', async () => {
    prismaMock.gasto.findMany.mockResolvedValue([
      { fecha: new Date('2026-11-02T00:00:00Z'), monto: 300 },
      { fecha: new Date('2026-11-10T00:00:00Z'), monto: 200 },
    ]);

    const serie = await service.getSerie(7, {
      desde: '2026-11-02',
      hasta: '2026-11-15',
      agrupacion: 'semana',
    });

    expect(serie.puntos).toEqual([
      { clave: '2026-11-02', etiqueta: '02/11', total: 300 },
      { clave: '2026-11-09', etiqueta: '09/11', total: 200 },
    ]);
  });

  it('usa día por defecto y devuelve ceros sin gastos', async () => {
    prismaMock.gasto.findMany.mockResolvedValue([]);

    const serie = await service.getSerie(7, {
      desde: '2026-11-01',
      hasta: '2026-11-02',
    });

    expect(serie.agrupacion).toBe('dia');
    expect(serie.totalGeneral).toBe(0);
    expect(serie.puntos).toHaveLength(2);
  });

  it('rechaza un rango demasiado grande', async () => {
    prismaMock.gasto.findMany.mockResolvedValue([]);

    await expect(
      service.getSerie(7, {
        desde: '2025-01-01',
        hasta: '2026-12-31',
        agrupacion: 'dia',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rechaza fechas invertidas', async () => {
    await expect(
      service.getSerie(7, {
        desde: '2026-11-10',
        hasta: '2026-11-01',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
