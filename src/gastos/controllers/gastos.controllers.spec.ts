import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { GastosAltaController } from './gastos-alta.controller.js';
import { GastosListadoController } from './gastos-listado.controller.js';
import { GastosResumenController } from './gastos-resumen.controller.js';
import { GastosBotController } from './gastos-bot.controller.js';
import { GastosDetalleController } from './gastos-detalle.controller.js';
import { GastosService } from '../services/gastos.service.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';

describe('Controladores de gastos', () => {
  let alta: GastosAltaController;
  let listado: GastosListadoController;
  let resumen: GastosResumenController;
  let bot: GastosBotController;
  let detalle: GastosDetalleController;

  const serviceMock = {
    create: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    getResumen: vi.fn(),
    getUltimos: vi.fn(),
    getUltimoGasto: vi.fn(),
    getGastoById: vi.fn(),
  };

  beforeEach(async () => {
    vi.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [
        GastosAltaController,
        GastosListadoController,
        GastosResumenController,
        GastosBotController,
        GastosDetalleController,
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
    detalle = module.get(GastosDetalleController);
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

  it('delega el resumen autenticado', async () => {
    serviceMock.getResumen.mockResolvedValue({ totalGeneral: 0 });

    await resumen.getResumen(9, { mes: 10 });

    expect(serviceMock.getResumen).toHaveBeenCalledWith(9, { mes: 10 });
  });

  it('delega el resumen del bot con su filtro de fechas', async () => {
    serviceMock.getResumen.mockResolvedValue({ totalGeneral: 0 });
    const filtro = { telegramId: '123', rango: '15_DAYS' as const };

    await bot.getResumenBot(filtro);

    expect(serviceMock.getResumen).toHaveBeenCalledWith('123', filtro);
  });

  it('delega los últimos gastos usando el telegramId', async () => {
    serviceMock.getUltimos.mockResolvedValue({ data: [], meta: {} });

    await bot.getUltimos({ telegramId: '123', limit: 5 });

    expect(serviceMock.getUltimos).toHaveBeenCalledWith('123', {
      telegramId: '123',
      limit: 5,
    });
  });

  it('delega los últimos gastos usando usuarioId cuando no hay telegramId', async () => {
    serviceMock.getUltimos.mockResolvedValue({ data: [], meta: {} });

    await bot.getUltimos({ usuarioId: '7' });

    expect(serviceMock.getUltimos).toHaveBeenCalledWith('7', { usuarioId: '7' });
  });

  it('delega el último gasto del bot', async () => {
    serviceMock.getUltimoGasto.mockResolvedValue({ id: 1 });

    await bot.ultimo('7', undefined, 'Coto', undefined, undefined);

    expect(serviceMock.getUltimoGasto).toHaveBeenCalledWith('7', {
      telegramId: undefined,
      comercio: 'Coto',
      categoria: undefined,
      desde: undefined,
    });
  });

  it('convierte el id de ruta a número en el detalle', async () => {
    serviceMock.getGastoById.mockResolvedValue({ id: 3 });

    await detalle.findOne({ user: { id: 9 } }, '3');

    expect(serviceMock.getGastoById).toHaveBeenCalledWith(9, 3);
  });

  it('usa el telegramId cuando no hay JWT en el detalle', async () => {
    serviceMock.getGastoById.mockResolvedValue({ id: 3 });

    await detalle.findOne({}, '3', '123');

    expect(serviceMock.getGastoById).toHaveBeenCalledWith('123', 3);
  });

  it('rechaza el detalle sin JWT ni telegramId', () => {
    expect(() => detalle.findOne({}, '3')).toThrow(UnauthorizedException);
  });

  it('delega la actualización parcial con JWT', async () => {
    serviceMock.update.mockResolvedValue({ id: 3 });

    await detalle.update({ user: { id: 9 } }, '3', { valor: 700 });

    expect(serviceMock.update).toHaveBeenCalledWith(9, 3, { valor: 700 });
  });

  it('delega la actualización parcial con telegramId', async () => {
    serviceMock.update.mockResolvedValue({ id: 3 });

    await detalle.update({}, '3', { monto: 700 }, '123');

    expect(serviceMock.update).toHaveBeenCalledWith('123', 3, { monto: 700 });
  });

  it('delega la eliminación', async () => {
    serviceMock.remove.mockResolvedValue({ id: 3 });

    await detalle.remove({ user: { id: 9 } }, '3');

    expect(serviceMock.remove).toHaveBeenCalledWith(9, 3);
  });

  it('rechaza la eliminación sin identidad', () => {
    expect(() => detalle.remove({}, '3')).toThrow(UnauthorizedException);
  });
});
