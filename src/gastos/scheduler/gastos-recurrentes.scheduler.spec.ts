import { GastosRecurrentesScheduler } from './gastos-recurrentes.scheduler.js';
import { GastosService } from '../services/gastos.service.js';

describe('GastosRecurrentesScheduler', () => {
  const gastosMock = {
    ejecutarVencidas: vi.fn(),
  };

  let scheduler: GastosRecurrentesScheduler;

  beforeEach(() => {
    vi.resetAllMocks();
    scheduler = new GastosRecurrentesScheduler(
      gastosMock as unknown as GastosService,
    );
  });

  it('ejecuta las reglas vencidas', async () => {
    gastosMock.ejecutarVencidas.mockResolvedValue([{ id: 1 }, { id: 2 }]);

    await scheduler.ejecutarVencidas();

    expect(gastosMock.ejecutarVencidas).toHaveBeenCalledTimes(1);
  });

  it('no falla cuando no hay reglas vencidas', async () => {
    gastosMock.ejecutarVencidas.mockResolvedValue([]);

    await expect(scheduler.ejecutarVencidas()).resolves.toBeUndefined();
  });

  it('registra el error sin propagarlo si la ejecución falla', async () => {
    gastosMock.ejecutarVencidas.mockRejectedValue(new Error('db caída'));

    await expect(scheduler.ejecutarVencidas()).resolves.toBeUndefined();
  });
});
