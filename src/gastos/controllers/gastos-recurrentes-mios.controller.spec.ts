import { describe, expect, it, vi } from 'vitest';
import { GastosRecurrentesMiosController } from './gastos-recurrentes-mios.controller.js';
import type { GastosService } from '../services/gastos.service.js';

describe('GastosRecurrentesMiosController', () => {
  const gastosService = {
    createRecurrente: vi.fn().mockResolvedValue({ id: 1 }),
    listRecurrentes: vi.fn().mockResolvedValue([]),
  } as unknown as GastosService;
  const controller = new GastosRecurrentesMiosController(gastosService);

  it('crea un recurrente usando el usuario del JWT', async () => {
    const dto = {
      monto: 1500,
      descripcion: 'Spotify',
      frecuencia: 'mensual' as const,
      categoriaId: 2,
    };

    await expect(controller.create(7, dto)).resolves.toEqual({ id: 1 });
    expect(gastosService.createRecurrente).toHaveBeenCalledWith({
      ...dto,
      usuarioId: 7,
    });
  });

  it('lista los recurrentes del usuario autenticado', async () => {
    await expect(controller.findAll(7)).resolves.toEqual([]);
    expect(gastosService.listRecurrentes).toHaveBeenCalledWith(7);
  });
});
