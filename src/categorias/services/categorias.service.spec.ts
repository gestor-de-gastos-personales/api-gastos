import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CategoriasService } from './categorias.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';

describe('CategoriasService', () => {
  let service: CategoriasService;

  const prismaMock = {
    categoria: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };

  beforeEach(async () => {
    vi.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriasService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<CategoriasService>(CategoriasService);
  });

  it('crea una categoría personalizada', async () => {
    prismaMock.categoria.create.mockResolvedValue({ id: 20, nombre: 'Gimnasio' });

    await expect(service.create({ nombre: 'Gimnasio' })).resolves.toEqual({
      id: 20,
      nombre: 'Gimnasio',
    });
    expect(prismaMock.categoria.create).toHaveBeenCalledWith({
      data: { nombre: 'Gimnasio' },
    });
  });

  it('lista todas las categorías', async () => {
    prismaMock.categoria.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);

    await expect(service.findAll()).resolves.toHaveLength(2);
  });

  it('devuelve una categoría existente', async () => {
    prismaMock.categoria.findUnique.mockResolvedValue({ id: 1, nombre: 'Alimentación' });

    await expect(service.findOne(1)).resolves.toEqual({
      id: 1,
      nombre: 'Alimentación',
    });
  });

  it('lanza NotFoundException si la categoría no existe', async () => {
    prismaMock.categoria.findUnique.mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('actualiza una categoría personalizada', async () => {
    prismaMock.categoria.findUnique.mockResolvedValue({ id: 20, default: false });
    prismaMock.categoria.update.mockResolvedValue({ id: 20, nombre: 'Deportes' });

    await expect(service.update(20, { nombre: 'Deportes' })).resolves.toEqual({
      id: 20,
      nombre: 'Deportes',
    });
  });

  it('impide modificar una categoría por defecto', async () => {
    prismaMock.categoria.findUnique.mockResolvedValue({ id: 1, default: true });

    await expect(service.update(1, { nombre: 'Otro' })).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(prismaMock.categoria.update).not.toHaveBeenCalled();
  });

  it('elimina una categoría personalizada', async () => {
    prismaMock.categoria.findUnique.mockResolvedValue({ id: 20, default: false });
    prismaMock.categoria.delete.mockResolvedValue({ id: 20 });

    await expect(service.remove(20)).resolves.toEqual({ id: 20 });
  });

  it('impide eliminar una categoría por defecto', async () => {
    prismaMock.categoria.findUnique.mockResolvedValue({ id: 1, default: true });

    await expect(service.remove(1)).rejects.toBeInstanceOf(ForbiddenException);
    expect(prismaMock.categoria.delete).not.toHaveBeenCalled();
  });
});
