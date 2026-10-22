import { Test, TestingModule } from '@nestjs/testing';
import { CategoriasEdicionController } from './categorias-edicion.controller.js';
import { CategoriasService } from '../services/categorias.service.js';

describe('CategoriasEdicionController', () => {
  let controller: CategoriasEdicionController;

  const serviceMock = {
    update: vi.fn(),
    remove: vi.fn(),
  };

  beforeEach(async () => {
    vi.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriasEdicionController],
      providers: [{ provide: CategoriasService, useValue: serviceMock }],
    }).compile();

    controller = module.get<CategoriasEdicionController>(
      CategoriasEdicionController,
    );
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
