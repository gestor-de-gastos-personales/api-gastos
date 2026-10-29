import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GastosRecurrentesService } from './gastos-recurrentes.service.js';
import { UsuariosGastosService } from './usuarios-gastos.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';

describe('GastosRecurrentesService', () => {
  let service: GastosRecurrentesService;

  const prismaMock = {
    usuario: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    categoria: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
    gasto: {
      create: vi.fn(),
    },
    gastoRecurrente: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
    },
  };

  beforeEach(async () => {
    vi.resetAllMocks();
    vi.useRealTimers();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GastosRecurrentesService,
        UsuariosGastosService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get(GastosRecurrentesService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('calcularProximaEjecucion', () => {
    it('suma un día para las reglas diarias', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-10-22T12:00:00.000Z'));

      const siguiente = service.calcularProximaEjecucion('DIARIA');

      expect(siguiente.toISOString()).toBe('2026-10-23T12:00:00.000Z');
    });

    it('programa la próxima semana cuando el día ya pasó', () => {
      vi.useFakeTimers();
      // 2026-10-22 es jueves (4); se pide lunes (1) → faltan 4 días.
      vi.setSystemTime(new Date('2026-10-22T12:00:00.000Z'));

      const siguiente = service.calcularProximaEjecucion('SEMANAL', undefined, 1);

      expect(siguiente.toISOString()).toBe('2026-10-26T12:00:00.000Z');
    });

    it('programa el mismo día de la semana siguiente cuando coincide', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-10-22T12:00:00.000Z'));

      const siguiente = service.calcularProximaEjecucion('SEMANAL', undefined, 4);

      expect(siguiente.toISOString()).toBe('2026-10-29T12:00:00.000Z');
    });

    it('programa el mes siguiente para las reglas mensuales', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-10-22T12:00:00.000Z'));

      const siguiente = service.calcularProximaEjecucion('MENSUAL', 15);

      expect(siguiente.toISOString()).toBe('2026-11-15T00:00:00.000Z');
    });

    it('programa el año siguiente para las reglas anuales', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-10-22T12:00:00.000Z'));

      const siguiente = service.calcularProximaEjecucion('ANUAL');

      expect(siguiente.toISOString()).toBe('2027-10-22T00:00:00.000Z');
    });
  });

  describe('createRecurrente', () => {
    it('resuelve el usuario de Telegram y la categoría por nombre', async () => {
      prismaMock.usuario.findFirst.mockResolvedValue({ id: 7 });
      prismaMock.categoria.findFirst.mockResolvedValue({ id: 3 });
      prismaMock.gastoRecurrente.create.mockResolvedValue({ id: 1 });

      await service.createRecurrente({
        usuarioId: 0,
        telegramId: '123',
        monto: 1500,
        descripcion: 'Netflix',
        categoria: 'Ocio',
        frecuencia: 'MENSUAL',
        diaMes: 5,
      });

      expect(prismaMock.gastoRecurrente.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            usuarioId: 7,
            categoriaId: 3,
            frecuencia: 'MENSUAL',
            diaMes: 5,
          }),
        }),
      );
    });

    it('usa el categoriaId cuando llega explícito', async () => {
      prismaMock.usuario.findFirst.mockResolvedValue({ id: 7 });
      prismaMock.gastoRecurrente.create.mockResolvedValue({ id: 1 });

      await service.createRecurrente({
        usuarioId: 0,
        telegramId: '123',
        monto: 100,
        descripcion: 'Gym',
        categoriaId: 9,
        frecuencia: 'SEMANAL',
      });

      expect(prismaMock.categoria.findFirst).not.toHaveBeenCalled();
      expect(prismaMock.gastoRecurrente.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ categoriaId: 9 }),
        }),
      );
    });
  });

  describe('listRecurrentes', () => {
    it('lista solo las reglas del usuario', async () => {
      prismaMock.usuario.findFirst.mockResolvedValue({ id: 7 });
      prismaMock.gastoRecurrente.findMany.mockResolvedValue([{ id: 1 }]);

      const reglas = await service.listRecurrentes('123');

      expect(reglas).toEqual([{ id: 1 }]);
      expect(prismaMock.gastoRecurrente.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { usuarioId: 7 } }),
      );
    });
  });

  describe('getRecurrentesVencidas', () => {
    it('busca solo reglas activas con próxima ejecución vencida', async () => {
      prismaMock.gastoRecurrente.findMany.mockResolvedValue([]);

      await service.getRecurrentesVencidas();

      expect(prismaMock.gastoRecurrente.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ activo: true }),
        }),
      );
    });
  });

  describe('updateRecurrente', () => {
    it('actualiza solo los campos enviados', async () => {
      prismaMock.usuario.findFirst.mockResolvedValue({ id: 7 });
      prismaMock.gastoRecurrente.findFirst.mockResolvedValue({
        id: 4,
        usuarioId: 7,
        categoriaId: 2,
        monto: 100,
        comercio: 'Gym',
        descripcion: 'Gym',
        frecuencia: 'MENSUAL',
        diaMes: 1,
        diaSemana: null,
        activo: true,
        proximaEjecucion: new Date('2026-11-01T00:00:00.000Z'),
      });
      prismaMock.gastoRecurrente.update.mockResolvedValue({ id: 4 });

      await service.updateRecurrente('123', 4, { activo: false });

      expect(prismaMock.gastoRecurrente.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 4 },
          data: expect.objectContaining({ activo: false, monto: 100 }),
        }),
      );
    });

    it('reprograma cuando cambia la frecuencia', async () => {
      prismaMock.usuario.findFirst.mockResolvedValue({ id: 7 });
      prismaMock.gastoRecurrente.findFirst.mockResolvedValue({
        id: 4,
        usuarioId: 7,
        categoriaId: 2,
        monto: 100,
        comercio: null,
        descripcion: 'Gym',
        frecuencia: 'MENSUAL',
        diaMes: 1,
        diaSemana: null,
        activo: true,
        proximaEjecucion: new Date('2026-11-01T00:00:00.000Z'),
      });
      prismaMock.gastoRecurrente.update.mockResolvedValue({ id: 4 });

      await service.updateRecurrente('123', 4, { frecuencia: 'DIARIA' });

      const data = prismaMock.gastoRecurrente.update.mock.calls[0][0].data;
      expect(data.proximaEjecucion).not.toEqual(
        new Date('2026-11-01T00:00:00.000Z'),
      );
    });

    it('lanza 404 si la regla pertenece a otro usuario', async () => {
      prismaMock.usuario.findFirst.mockResolvedValue({ id: 7 });
      prismaMock.gastoRecurrente.findFirst.mockResolvedValue(null);

      await expect(
        service.updateRecurrente('123', 4, { activo: false }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('removeRecurrente', () => {
    it('elimina una regla propia', async () => {
      prismaMock.usuario.findFirst.mockResolvedValue({ id: 7 });
      prismaMock.gastoRecurrente.findFirst.mockResolvedValue({ id: 4 });
      prismaMock.gastoRecurrente.delete.mockResolvedValue({ id: 4 });

      await expect(service.removeRecurrente('123', 4)).resolves.toEqual({ id: 4 });
    });

    it('no elimina reglas de otro usuario', async () => {
      prismaMock.usuario.findFirst.mockResolvedValue({ id: 7 });
      prismaMock.gastoRecurrente.findFirst.mockResolvedValue(null);

      await expect(service.removeRecurrente('123', 4)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(prismaMock.gastoRecurrente.delete).not.toHaveBeenCalled();
    });
  });

  describe('ejecutarRecurrente', () => {
    it('no ejecuta reglas inactivas', async () => {
      prismaMock.gastoRecurrente.findUnique.mockResolvedValue({
        id: 4,
        activo: false,
      });

      await expect(service.ejecutarRecurrente(4)).resolves.toBeNull();
      expect(prismaMock.gasto.create).not.toHaveBeenCalled();
    });

    it('no ejecuta reglas inexistentes', async () => {
      prismaMock.gastoRecurrente.findUnique.mockResolvedValue(null);

      await expect(service.ejecutarRecurrente(99)).resolves.toBeNull();
    });

    it('crea el gasto y reprograma la regla', async () => {
      prismaMock.gastoRecurrente.findUnique.mockResolvedValue({
        id: 4,
        activo: true,
        descripcion: 'Netflix',
        monto: 5000,
        categoriaId: 2,
        usuarioId: 7,
        frecuencia: 'MENSUAL',
        diaMes: 5,
        diaSemana: null,
      });
      prismaMock.gasto.create.mockResolvedValue({ id: 10 });
      prismaMock.gastoRecurrente.update.mockResolvedValue({ id: 4 });

      const gasto = await service.ejecutarRecurrente(4);

      expect(gasto).toEqual({ id: 10 });
      expect(prismaMock.gastoRecurrente.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ notificado: false }),
        }),
      );
    });
  });

  describe('ejecutarVencidas', () => {
    it('ejecuta solo las reglas vencidas y activas', async () => {
      prismaMock.gastoRecurrente.findMany.mockResolvedValue([
        { id: 1 },
        { id: 2 },
      ]);
      prismaMock.gastoRecurrente.findUnique
        .mockResolvedValueOnce({
          id: 1,
          activo: true,
          descripcion: 'A',
          monto: 10,
          categoriaId: 1,
          usuarioId: 1,
          frecuencia: 'DIARIA',
          diaMes: null,
          diaSemana: null,
        })
        .mockResolvedValueOnce({
          id: 2,
          activo: false,
          descripcion: 'B',
          monto: 20,
          categoriaId: 1,
          usuarioId: 1,
          frecuencia: 'DIARIA',
          diaMes: null,
          diaSemana: null,
        });
      prismaMock.gasto.create.mockResolvedValue({ id: 11 });

      const ejecutadas = await service.ejecutarVencidas();

      expect(ejecutadas).toHaveLength(1);
      expect(prismaMock.gasto.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('obtenerYMarcarNotificaciones', () => {
    it('devuelve vacío cuando no hay pendientes', async () => {
      prismaMock.gastoRecurrente.findMany.mockResolvedValue([]);

      await expect(service.obtenerYMarcarNotificaciones()).resolves.toEqual([]);
      expect(prismaMock.gastoRecurrente.updateMany).not.toHaveBeenCalled();
    });

    it('marca como notificadas y devuelve el aviso una sola vez', async () => {
      prismaMock.gastoRecurrente.findMany.mockResolvedValue([
        {
          id: 4,
          descripcion: 'Netflix',
          monto: 5000,
          ultimaEjecucion: new Date('2026-10-22T10:00:00.000Z'),
          usuario: { telegramId: '123' },
        },
      ]);
      prismaMock.gastoRecurrente.updateMany.mockResolvedValue({ count: 1 });

      const avisos = await service.obtenerYMarcarNotificaciones();

      expect(avisos).toEqual([
        {
          reglaId: 4,
          telegramId: '123',
          descripcion: 'Netflix',
          monto: 5000,
          fecha: new Date('2026-10-22T10:00:00.000Z'),
        },
      ]);
      expect(prismaMock.gastoRecurrente.updateMany).toHaveBeenCalledWith({
        where: { id: { in: [4] } },
        data: { notificado: true },
      });
    });
  });
});
