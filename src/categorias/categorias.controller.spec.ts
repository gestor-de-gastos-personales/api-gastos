import { Test, TestingModule } from '@nestjs/testing';
import { CategoriasController } from './categorias.controller.js';
import { CategoriasService } from './categorias.service.js';

describe('CategoriasController', () => {
  let controller: CategoriasController;

  const serviceMock = {
    create: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };

  beforeEach(async () => {
    vi.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriasController],
      providers: [{ provide: CategoriasService, useValue: serviceMock }],
    }).compile();

    controller = module.get<CategoriasController>(CategoriasController);
  });

  it('delega la creación', async () => {
    serviceMock.create.mockResolvedValue({ id: 20, nombre: 'Gimnasio' });

    await expect(controller.create({ nombre: 'Gimnasio' })).resolves.toEqual({
      id: 20,
      nombre: 'Gimnasio',
    });
  });

  it('delega el listado', async () => {
    serviceMock.findAll.mockResolvedValue([{ id: 1 }]);

    await expect(controller.findAll()).resolves.toHaveLength(1);
  });

  it('convierte el id de ruta a número en el detalle', async () => {
    serviceMock.findOne.mockResolvedValue({ id: 4 });

    await controller.findOne('4');

    expect(serviceMock.findOne).toHaveBeenCalledWith(4);
  });

  it('convierte el id de ruta a número en la actualización', async () => {
    serviceMock.update.mockResolvedValue({ id: 4 });

    await controller.update('4', { nombre: 'Nueva' });

    expect(serviceMock.update).toHaveBeenCalledWith(4, { nombre: 'Nueva' });
  });

  it('convierte el id de ruta a número en la eliminación', async () => {
    serviceMock.remove.mockResolvedValue({ id: 4 });

    await controller.remove('4');

    expect(serviceMock.remove).toHaveBeenCalledWith(4);
  });
});
