import { esRequerido, esTexto } from '../../common/validadores.js';

import { CredencialesDto } from './credenciales.dto.js';

export class VincularTelegramDto extends CredencialesDto {
  @esTexto()
  @esRequerido({ message: 'El telegramId es requerido' })
  telegramId: string;
}
