import { Test, TestingModule } from '@nestjs/testing';
import { PresupuestosController } from './presupuestos.controller.js';
import { PresupuestosService } from './presupuestos.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

describe('PresupuestosController', () => {
  let controller: PresupuestosController;

  const serviceMock = {
    listar: vi.fn(),
    guardar: vi.fn(),
    listarPorUsuario: vi.fn(),
    guardarParaUsuario: vi.fn(),
  };

  beforeEach(async () => {
    vi.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PresupuestosController],
      providers: [{ provide: PresupuestosService, useValue: serviceMock }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(PresupuestosController);
  });

  it('lista los presupuestos del usuario autenticado', async () => {
    serviceMock.listarPorUsuario.mockResolvedValue({ data: [], total: 0 });

    await controller.listarMios(7, '11', '2026');

    expect(serviceMock.listarPorUsuario).toHaveBeenCalledWith(7, 11, 2026);
  });

  it('guarda el presupuesto del usuario autenticado', async () => {
    const dto = { categoriaId: 1, monto: 5000, mes: 11, anio: 2026 };
    serviceMock.guardarParaUsuario.mockResolvedValue({ id: 1 });

    await controller.guardarMio(7, dto);

    expect(serviceMock.guardarParaUsuario).toHaveBeenCalledWith(7, dto);
  });

  it('mantiene las rutas públicas del bot', async () => {
    serviceMock.listar.mockResolvedValue({ data: [], total: 0 });
    serviceMock.guardar.mockResolvedValue({ id: 2 });

    await controller.listar('77', undefined, undefined);
    await controller.guardar({
      telegramId: '77',
      categoriaId: 1,
      monto: 5000,
      mes: 11,
      anio: 2026,
    });

    expect(serviceMock.listar).toHaveBeenCalledWith('77', undefined, undefined);
    expect(serviceMock.guardar).toHaveBeenCalled();
  });
});
