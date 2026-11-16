import { esOpcional, esTexto } from '../../common/validadores.js';

import { VincularTelegramDto } from './vincular-telegram.dto.js';

export class RegisterTelegramDto extends VincularTelegramDto {
  @esOpcional()
  @esTexto()
  nombre?: string;
}
