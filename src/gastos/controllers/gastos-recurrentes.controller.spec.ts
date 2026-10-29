import { GastosRecurrentesController } from './gastos-recurrentes.controller.js';
import { GastosService } from '../services/gastos.service.js';

describe('GastosRecurrentesController', () => {
  const serviceMock = {
    createRecurrente: vi.fn(),
    listRecurrentes: vi.fn(),
    getRecurrentesVencidas: vi.fn(),
    ejecutarRecurrente: vi.fn(),
    updateRecurrente: vi.fn(),
    removeRecurrente: vi.fn(),
  };

  let controller: GastosRecurrentesController;

  beforeEach(() => {
    vi.resetAllMocks();
    controller = new GastosRecurrentesController(
      serviceMock as unknown as GastosService,
    );
  });

  it('delega el alta de una regla', async () => {
    const dto = {
      usuarioId: 0,
      telegramId: '123',
      monto: 100,
      descripcion: 'Gym',
      categoria: 'Salud',
      frecuencia: 'MENSUAL',
    };
    serviceMock.createRecurrente.mockResolvedValue({ id: 1 });

    await expect(controller.create(dto as never)).resolves.toEqual({ id: 1 });
    expect(serviceMock.createRecurrente).toHaveBeenCalledWith(dto);
  });

  it('lista usando el telegramId', async () => {
    serviceMock.listRecurrentes.mockResolvedValue([]);

    await controller.findAll(undefined, '123');

    expect(serviceMock.listRecurrentes).toHaveBeenCalledWith('123', '123');
  });

  it('lista usando el usuarioId cuando no hay telegramId', async () => {
    serviceMock.listRecurrentes.mockResolvedValue([]);

    await controller.findAll('7', undefined);

    expect(serviceMock.listRecurrentes).toHaveBeenCalledWith('7', undefined);
  });

  it('devuelve las reglas vencidas', async () => {
    serviceMock.getRecurrentesVencidas.mockResolvedValue([]);

    await expect(controller.vencidas()).resolves.toEqual([]);
  });

  it('ejecuta una regla puntual', async () => {
    serviceMock.ejecutarRecurrente.mockResolvedValue({ id: 1 });

    await controller.ejecutar({ reglaId: 1 });

    expect(serviceMock.ejecutarRecurrente).toHaveBeenCalledWith(1);
  });

  it('ejecuta todas las vencidas cuando no se indica regla', async () => {
    serviceMock.getRecurrentesVencidas.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    serviceMock.ejecutarRecurrente.mockResolvedValue({ id: 1 });

    await controller.ejecutar({});

    expect(serviceMock.ejecutarRecurrente).toHaveBeenCalledTimes(2);
  });

  it('actualiza una regla resolviendo el telegramId', async () => {
    serviceMock.updateRecurrente.mockResolvedValue({ id: 1 });

    await controller.update('1', { activo: false }, undefined, '123');

    expect(serviceMock.updateRecurrente).toHaveBeenCalledWith(
      '123',
      1,
      { activo: false },
      '123',
    );
  });

  it('elimina una regla resolviendo el telegramId', async () => {
    serviceMock.removeRecurrente.mockResolvedValue({ id: 1 });

    await controller.remove('1', undefined, '123');

    expect(serviceMock.removeRecurrente).toHaveBeenCalledWith('123', 1, '123');
  });
});
