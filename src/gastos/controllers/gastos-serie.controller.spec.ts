import { Test, TestingModule } from '@nestjs/testing';
import { GastosSerieController } from './gastos-serie.controller.js';
import { GastosSerieService } from '../services/gastos-serie.service.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';

describe('GastosSerieController', () => {
  let controller: GastosSerieController;

  const serviceMock = { getSerie: vi.fn() };

  beforeEach(async () => {
    vi.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GastosSerieController],
      providers: [{ provide: GastosSerieService, useValue: serviceMock }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(GastosSerieController);
  });

  it('delega la serie con el usuario autenticado', async () => {
    const filtro = { desde: '2026-11-01', hasta: '2026-11-30' };
    serviceMock.getSerie.mockResolvedValue({ puntos: [] });

    await expect(controller.getSerie(7, filtro)).resolves.toEqual({
      puntos: [],
    });
    expect(serviceMock.getSerie).toHaveBeenCalledWith(7, filtro);
  });
});
