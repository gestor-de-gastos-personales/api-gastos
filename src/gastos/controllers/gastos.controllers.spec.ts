import { Test, TestingModule } from '@nestjs/testing';
import { GastosAltaController } from './gastos-alta.controller.js';
import { GastosListadoController } from './gastos-listado.controller.js';
import { GastosResumenController } from './gastos-resumen.controller.js';
import { GastosBotController } from './gastos-bot.controller.js';
import { GastosEdicionController } from './gastos-edicion.controller.js';
import { GastosService } from '../services/gastos.service.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';

describe('Controladores de gastos', () => {
  let alta: GastosAltaController;
  let listado: GastosListadoController;
  let resumen: GastosResumenController;
  let bot: GastosBotController;
  let edicion: GastosEdicionController;

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
      controllers: [
        GastosAltaController,
        GastosListadoController,
        GastosResumenController,
        GastosBotController,
        GastosEdicionController,
      ],
      providers: [{ provide: GastosService, useValue: serviceMock }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    alta = module.get(GastosAltaController);
    listado = module.get(GastosListadoController);
    resumen = module.get(GastosResumenController);
    bot = module.get(GastosBotController);
    edicion = module.get(GastosEdicionController);
  });

  it('delega la creación desde el bot con el telegramId', async () => {
    const body = { telegramId: '123', monto: 500, categoria: 1 };
    serviceMock.create.mockResolvedValue({ id: 1 });

    await expect(bot.createFromBot(body)).resolves.toEqual({ id: 1 });
    expect(serviceMock.create).toHaveBeenCalledWith('123', body);
  });

  it('delega la creación autenticada con el id del usuario', async () => {
    const dto = { descripcion: 'Cena', valor: 2000, categoria: 1 };
    serviceMock.create.mockResolvedValue({ id: 2 });

    await alta.create(9, dto);

    expect(serviceMock.create).toHaveBeenCalledWith(9, dto);
  });

  it('delega el listado con filtros', async () => {
    serviceMock.findAll.mockResolvedValue({ data: [], meta: {} });

    await listado.findAll(9, { page: 1, limit: 5 });

    expect(serviceMock.findAll).toHaveBeenCalledWith(9, { page: 1, limit: 5 });
  });

  it('convierte el id de ruta a número en el detalle', async () => {
    serviceMock.findOne.mockResolvedValue({ id: 3 });

    await listado.findOne(9, '3');

    expect(serviceMock.findOne).toHaveBeenCalledWith(9, 3);
  });

  it('delega el resumen autenticado', async () => {
    serviceMock.getResumen.mockResolvedValue({ totalGeneral: 0 });

    await resumen.getResumen(9, { mes: 10 });

    expect(serviceMock.getResumen).toHaveBeenCalledWith(9, { mes: 10 });
  });

  it('delega el resumen del bot por telegramId', async () => {
    serviceMock.getResumen.mockResolvedValue({ totalGeneral: 0 });

    await bot.getResumenBot('123');

    expect(serviceMock.getResumen).toHaveBeenCalledWith('123', {});
  });

  it('delega la actualización parcial', async () => {
    serviceMock.update.mockResolvedValue({ id: 3 });

    await edicion.update({ usuarioId: 9, id: 3 }, { valor: 700 });

    expect(serviceMock.update).toHaveBeenCalledWith(9, 3, { valor: 700 });
  });

  it('delega la eliminación', async () => {
    serviceMock.remove.mockResolvedValue({ id: 3 });

    await edicion.remove({ usuarioId: 9, id: 3 });

    expect(serviceMock.remove).toHaveBeenCalledWith(9, 3);
  });
});
