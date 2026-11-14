import * as servicios from './services/index.js';
import * as controladores from './controllers/index.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';

export const AUTH_PROVIDERS = [
  servicios.AuthRegistroService,
  servicios.AuthLoginService,
  servicios.AuthPerfilService,
  servicios.AuthTelegramService,
  JwtStrategy,
];

export const AUTH_CONTROLLERS = [
  controladores.AuthController,
  controladores.TelegramAuthController,
];
