import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller.js';
import { AuthService } from '../services/auth.service.js';

describe('AuthController', () => {
  let controller: AuthController;

  const serviceMock = {
    register: vi.fn(),
    login: vi.fn(),
  };

  beforeEach(async () => {
    vi.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: serviceMock }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('delega el registro', async () => {
    const dto = { email: 'ana@mail.com', password: '123456', nombre: 'Ana' };
    serviceMock.register.mockResolvedValue({ id: 1 });

    await expect(controller.register(dto)).resolves.toEqual({ id: 1 });
    expect(serviceMock.register).toHaveBeenCalledWith(dto);
  });

  it('delega el login', async () => {
    const dto = { email: 'ana@mail.com', password: '123456' };
    serviceMock.login.mockResolvedValue({ access_token: 'jwt' });

    await expect(controller.login(dto)).resolves.toEqual({
      access_token: 'jwt',
    });
    expect(serviceMock.login).toHaveBeenCalledWith(dto);
  });
});
