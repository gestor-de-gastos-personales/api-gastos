import * as nj from '../../common/nest.js';
import { AuthTelegramService } from '../services/auth-telegram.service.js';
import * as DTO from '../dto/index.js';

/**
 * Flujos de autenticación que consume el bot de Telegram.
 * Se mantienen separados del login web para que cada controlador
 * tenga una única responsabilidad y un acoplamiento acotado.
 */
@nj.controller('auth')
export class TelegramAuthController {
  constructor(private readonly authTelegram: AuthTelegramService) {}

  // Vincular un usuario existente de la Web con su Telegram
  @nj.post('vincular-telegram')
  vincularTelegram(@nj.body() dto: DTO.VincularTelegramDto) {
    return this.authTelegram.vincularTelegram(dto);
  }

  // Registrar un nuevo usuario desde Telegram directamente
  @nj.post('register-telegram')
  registerTelegram(@nj.body() dto: DTO.RegisterTelegramDto) {
    return this.authTelegram.registerTelegram(dto);
  }
}
