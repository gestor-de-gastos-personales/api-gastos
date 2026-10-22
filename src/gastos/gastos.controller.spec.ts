import { Test, TestingModule } from '@nestjs/testing';
import { GastosController } from './gastos.controller.js';
import { GastosService } from './gastos.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

describe('GastosController', () => {
  let controller: GastosController;

  const serviceMock = {
    create: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    getResumen: vi.fn(),
  };

  beforeEach(async () => {
    vi.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GastosController],
      providers: [{ provide: GastosService, useValue: serviceMock }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<GastosController>(GastosController);
  });

  it('delega la creación desde el bot con el telegramId', async () => {
    const body = { telegramId: '123', monto: 500, categoria: 1 };
    serviceMock.create.mockResolvedValue({ id: 1 });

    await expect(controller.createFromBot(body)).resolves.toEqual({ id: 1 });
    expect(serviceMock.create).toHaveBeenCalledWith('123', body);
  });

  it('delega la creación autenticada con el id del usuario', async () => {
    const dto = { descripcion: 'Cena', valor: 2000, categoria: 1 };
    serviceMock.create.mockResolvedValue({ id: 2 });

    await controller.create(9, dto);

    expect(serviceMock.create).toHaveBeenCalledWith(9, dto);
  });

  it('delega el listado con filtros', async () => {
    serviceMock.findAll.mockResolvedValue({ data: [], meta: {} });

    await controller.findAll(9, { page: 1, limit: 5 });

    expect(serviceMock.findAll).toHaveBeenCalledWith(9, { page: 1, limit: 5 });
  });

  it('delega el resumen autenticado', async () => {
    serviceMock.getResumen.mockResolvedValue({ totalGeneral: 0 });

    await controller.getResumen(9, { mes: 10 });

    expect(serviceMock.getResumen).toHaveBeenCalledWith(9, { mes: 10 });
  });

  it('delega el resumen del bot por telegramId', async () => {
    serviceMock.getResumen.mockResolvedValue({ totalGeneral: 0 });

    await controller.getResumenBot('123');

    expect(serviceMock.getResumen).toHaveBeenCalledWith('123', {});
  });

  it('delega la actualización parcial', async () => {
    serviceMock.update.mockResolvedValue({ id: 3 });

    await controller.update(9, 3, { valor: 700 });

    expect(serviceMock.update).toHaveBeenCalledWith(9, 3, { valor: 700 });
  });

  it('delega la eliminación', async () => {
    serviceMock.remove.mockResolvedValue({ id: 3 });

    await controller.remove(9, 3);

    expect(serviceMock.remove).toHaveBeenCalledWith(9, 3);
  });
});
