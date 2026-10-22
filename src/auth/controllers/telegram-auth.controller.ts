import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from '../services/auth.service.js';
import { VincularTelegramDto } from '../dto/vincular-telegram.dto.js';
import { RegisterTelegramDto } from '../dto/register-telegram.dto.js';

/**
 * Flujos de autenticación que consume el bot de Telegram.
 * Se mantienen separados del login web para que cada controlador
 * tenga una única responsabilidad y un acoplamiento acotado.
 */
@Controller('auth')
export class TelegramAuthController {
  constructor(private readonly authService: AuthService) {}

  // Vincular un usuario existente de la Web con su Telegram
  @Post('vincular-telegram')
  vincularTelegram(@Body() dto: VincularTelegramDto) {
    return this.authService.vincularTelegram(dto);
  }

  // Registrar un nuevo usuario desde Telegram directamente
  @Post('register-telegram')
  registerTelegram(@Body() dto: RegisterTelegramDto) {
    return this.authService.registerTelegram(dto);
  }
}
