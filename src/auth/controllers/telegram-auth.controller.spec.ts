import { Test, TestingModule } from '@nestjs/testing';
import { TelegramAuthController } from './telegram-auth.controller.js';
import { AuthService } from '../services/auth.service.js';

describe('TelegramAuthController', () => {
  let controller: TelegramAuthController;

  const serviceMock = {
    vincularTelegram: vi.fn(),
    registerTelegram: vi.fn(),
  };

  beforeEach(async () => {
    vi.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TelegramAuthController],
      providers: [{ provide: AuthService, useValue: serviceMock }],
    }).compile();

    controller = module.get<TelegramAuthController>(TelegramAuthController);
  });

  it('delega la vinculación de Telegram', async () => {
    const dto = { email: 'ana@mail.com', password: '123456', telegramId: '55' };
    serviceMock.vincularTelegram.mockResolvedValue({ id: 1 });

    await controller.vincularTelegram(dto);

    expect(serviceMock.vincularTelegram).toHaveBeenCalledWith(dto);
  });

  it('delega el registro desde Telegram', async () => {
    const dto = {
      email: 'bot@mail.com',
      password: '123456',
      telegramId: '55',
    };
    serviceMock.registerTelegram.mockResolvedValue({ id: 2 });

    await controller.registerTelegram(dto);

    expect(serviceMock.registerTelegram).toHaveBeenCalledWith(dto);
  });
});
