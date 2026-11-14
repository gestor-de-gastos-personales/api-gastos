import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller.js';
import { AuthRegistroService } from '../services/auth-registro.service.js';
import { AuthLoginService } from '../services/auth-login.service.js';
import { AuthPerfilService } from '../services/auth-perfil.service.js';

describe('AuthController', () => {
  let controller: AuthController;

  const registroMock = { register: vi.fn() };
  const loginMock = { login: vi.fn() };
  const perfilMock = { perfil: vi.fn() };

  beforeEach(async () => {
    vi.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthRegistroService, useValue: registroMock },
        { provide: AuthLoginService, useValue: loginMock },
        { provide: AuthPerfilService, useValue: perfilMock },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('delega el registro', async () => {
    const dto = { email: 'ana@mail.com', password: '123456', nombre: 'Ana' };
    registroMock.register.mockResolvedValue({ id: 1 });

    await expect(controller.register(dto)).resolves.toEqual({ id: 1 });
    expect(registroMock.register).toHaveBeenCalledWith(dto);
  });

  it('delega el login', async () => {
    const dto = { email: 'ana@mail.com', password: '123456' };
    loginMock.login.mockResolvedValue({ access_token: 'jwt' });

    await expect(controller.login(dto)).resolves.toEqual({
      access_token: 'jwt',
    });
    expect(loginMock.login).toHaveBeenCalledWith(dto);
  });

  it('devuelve el perfil del usuario autenticado', async () => {
    perfilMock.perfil.mockResolvedValue({ id: 7, email: 'ana@mail.com' });

    await expect(controller.me(7)).resolves.toEqual({
      id: 7,
      email: 'ana@mail.com',
    });
    expect(perfilMock.perfil).toHaveBeenCalledWith(7);
  });
});
