import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GastosService } from './gastos.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';

describe('GastosService', () => {
  let service: GastosService;

  const prismaMock = {
    usuario: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    categoria: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    gasto: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      groupBy: vi.fn(),
    },
    $transaction: vi.fn((operaciones: Promise<unknown>[]) =>
      Promise.all(operaciones),
    ),
  };

  beforeEach(async () => {
    vi.resetAllMocks();
    prismaMock.$transaction.mockImplementation(
      (operaciones: Promise<unknown>[]) => Promise.all(operaciones),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GastosService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<GastosService>(GastosService);
  });

  describe('create', () => {
    it('resuelve la categoría por id y reutiliza el usuario de Telegram', async () => {
      prismaMock.usuario.findFirst.mockResolvedValue({ id: 7, telegramId: '123' });
      prismaMock.categoria.findUnique.mockResolvedValue({ id: 3, nombre: 'Ocio' });
      prismaMock.gasto.create.mockResolvedValue({ id: 1 });

      const resultado = await service.create('123', {
        monto: 1500,
        categoria: 3,
        comercio: 'Cine',
      });

      expect(prismaMock.usuario.create).not.toHaveBeenCalled();
      expect(prismaMock.gasto.create).toHaveBeenCalledWith({
        data: {
          descripcion: 'Cine',
          monto: 1500,
          fecha: expect.any(Date),
          categoria: { connect: { id: 3 } },
          usuario: { connect: { id: 7 } },
        },
      });
      expect(resultado).toEqual({ id: 1 });
    });

    it('crea un usuario provisorio cuando el telegramId no existe', async () => {
      prismaMock.usuario.findFirst.mockResolvedValue(null);
      prismaMock.usuario.create.mockResolvedValue({ id: 99 });
      prismaMock.categoria.findFirst.mockResolvedValue({ id: 5, nombre: 'Salud' });
      prismaMock.gasto.create.mockResolvedValue({ id: 2 });

      await service.create('telegram-nuevo', {
        valor: 800,
        category: 'salud',
      });

      expect(prismaMock.usuario.create).toHaveBeenCalledWith({
        data: {
          telegramId: 'telegram-nuevo',
          nombre: 'Usuario Telegram telegram-nuevo',
        },
      });
      expect(prismaMock.categoria.findFirst).toHaveBeenCalledWith({
        where: { nombre: { equals: 'salud', mode: 'insensitive' } },
      });
      expect(prismaMock.gasto.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ monto: 800, usuario: { connect: { id: 99 } } }),
        }),
      );
    });

    it('acepta un id numérico de usuario sin consultar Telegram', async () => {
      prismaMock.categoria.findUnique.mockResolvedValue({ id: 1, nombre: 'Varios' });
      prismaMock.gasto.create.mockResolvedValue({ id: 3 });

      await service.create(42, { total: 100, categoria: 1, descripcion: 'Varios' });

      expect(prismaMock.usuario.findFirst).not.toHaveBeenCalled();
      expect(prismaMock.usuario.create).not.toHaveBeenCalled();
    });

    it('lanza NotFoundException si la categoría no existe', async () => {
      prismaMock.usuario.findFirst.mockResolvedValue({ id: 1 });
      prismaMock.categoria.findUnique.mockResolvedValue(null);
      prismaMock.categoria.findFirst.mockResolvedValue(null);

      await expect(
        service.create('123', { monto: 10, categoria: 999 }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(prismaMock.gasto.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('devuelve datos y metadatos de paginación', async () => {
      const gastos = [{ id: 1 }, { id: 2 }];
      prismaMock.gasto.findMany.mockResolvedValue(gastos);
      prismaMock.gasto.count.mockResolvedValue(25);

      const resultado = await service.findAll(1, { page: 2, limit: 10 });

      expect(resultado).toEqual({
        data: gastos,
        meta: { total: 25, page: 2, limit: 10, totalPages: 3 },
      });
      expect(prismaMock.gasto.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 }),
      );
    });

    it('aplica filtros de fecha y categoría', async () => {
      prismaMock.gasto.findMany.mockResolvedValue([]);
      prismaMock.gasto.count.mockResolvedValue(0);

      await service.findAll(1, {
        fechaInicio: '01-10-2026',
        fechaFin: '31-10-2026',
        categoriaId: 4,
      });

      const where = prismaMock.gasto.findMany.mock.calls[0][0].where;
      expect(where.usuarioId).toBe(1);
      expect(where.categoriaId).toBe(4);
      expect(where.fecha.gte).toEqual(new Date('2026-10-01T00:00:00.000Z'));
      expect(where.fecha.lte).toEqual(new Date('2026-10-31T23:59:59.999Z'));
    });
  });

  describe('findOne', () => {
    it('devuelve el gasto del usuario', async () => {
      const gasto = { id: 5, usuarioId: 1 };
      prismaMock.gasto.findFirst.mockResolvedValue(gasto);

      await expect(service.findOne(1, 5)).resolves.toEqual(gasto);
    });

    it('lanza NotFoundException si el gasto no pertenece al usuario', async () => {
      prismaMock.gasto.findFirst.mockResolvedValue(null);

      await expect(service.findOne(1, 99)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('resuelve la categoría por id y actualiza el gasto', async () => {
      prismaMock.gasto.findFirst.mockResolvedValue({ id: 5 });
      prismaMock.categoria.findUnique.mockResolvedValue({ id: 2, nombre: 'Transporte' });
      prismaMock.gasto.update.mockResolvedValue({ id: 5, monto: 300 });

      await service.update(1, 5, {
        categoria: 2,
        valor: 300,
        descripcion: 'Colectivo',
        fecha: '15-10-2026',
      });

      expect(prismaMock.gasto.update).toHaveBeenCalledWith({
        where: { id: 5 },
        data: {
          descripcion: 'Colectivo',
          monto: 300,
          categoria: { connect: { id: 2 } },
          fecha: new Date('2026-10-15T00:00:00.000Z'),
        },
      });
    });

    it('no sobreescribe los campos omitidos en una actualización parcial', async () => {
      prismaMock.gasto.findFirst.mockResolvedValue({ id: 5 });
      prismaMock.gasto.update.mockResolvedValue({ id: 5, monto: 300 });

      await service.update(1, 5, { valor: 300 });

      expect(prismaMock.gasto.update).toHaveBeenCalledWith({
        where: { id: 5 },
        data: { monto: 300 },
      });
    });

    it('lanza NotFoundException si la nueva categoría no existe', async () => {
      prismaMock.gasto.findFirst.mockResolvedValue({ id: 5 });
      prismaMock.categoria.findFirst.mockResolvedValue(null);
      prismaMock.categoria.findUnique.mockResolvedValue(null);

      await expect(
        service.update(1, 5, { categoria: 999 }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(prismaMock.gasto.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('elimina un gasto previamente validado', async () => {
      prismaMock.gasto.findFirst.mockResolvedValue({ id: 5, usuarioId: 1 });
      prismaMock.gasto.delete.mockResolvedValue({ id: 5 });

      await expect(service.remove(1, 5)).resolves.toEqual({ id: 5 });
      expect(prismaMock.gasto.delete).toHaveBeenCalledWith({ where: { id: 5 } });
    });

    it('no elimina gastos de otro usuario', async () => {
      prismaMock.gasto.findFirst.mockResolvedValue(null);

      await expect(service.remove(1, 77)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(prismaMock.gasto.delete).not.toHaveBeenCalled();
    });
  });

  describe('getResumen', () => {
    it('agrupa por categoría y calcula porcentajes del período', async () => {
      prismaMock.gasto.groupBy.mockResolvedValue([
        { categoriaId: 1, _sum: { monto: 750 } },
        { categoriaId: 2, _sum: { monto: 250 } },
      ]);
      prismaMock.categoria.findMany.mockResolvedValue([
        { id: 1, nombre: 'Alimentación' },
        { id: 2, nombre: 'Transporte' },
      ]);

      const resumen = await service.getResumen(5, { mes: 10, anio: 2026 });

      expect(resumen.totalGeneral).toBe(1000);
      expect(resumen.porCategoria).toEqual([
        {
          categoriaId: 1,
          categoriaNombre: 'Alimentación',
          total: 750,
          porcentaje: 75,
        },
        {
          categoriaId: 2,
          categoriaNombre: 'Transporte',
          total: 250,
          porcentaje: 25,
        },
      ]);
      expect(prismaMock.gasto.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({
          by: ['categoriaId'],
          where: expect.objectContaining({ usuarioId: 5 }),
        }),
      );
    });

    it('informa total cero cuando no hay gastos en el período', async () => {
      prismaMock.gasto.groupBy.mockResolvedValue([]);
      prismaMock.categoria.findMany.mockResolvedValue([]);

      const resumen = await service.getResumen(5, { anio: 2026 });

      expect(resumen.totalGeneral).toBe(0);
      expect(resumen.porCategoria).toEqual([]);
    });
  });
});
