import * as nest from '@nestjs/common';
import { AuthTelegramService } from '../services/auth-telegram.service.js';
import * as DTO from '../dto/index.js';

/**
 * Flujos de autenticación que consume el bot de Telegram.
 * Se mantienen separados del login web para que cada controlador
 * tenga una única responsabilidad y un acoplamiento acotado.
 */
@nest.Controller('auth')
export class TelegramAuthController {
  constructor(private readonly authTelegram: AuthTelegramService) {}

  // Vincular un usuario existente de la Web con su Telegram
  @nest.Post('vincular-telegram')
  vincularTelegram(@nest.Body() dto: DTO.VincularTelegramDto) {
    return this.authTelegram.vincularTelegram(dto);
  }

  // Registrar un nuevo usuario desde Telegram directamente
  @nest.Post('register-telegram')
  registerTelegram(@nest.Body() dto: DTO.RegisterTelegramDto) {
    return this.authTelegram.registerTelegram(dto);
  }
}
