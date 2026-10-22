import { IsNotEmpty, IsString } from 'class-validator';
import { CredencialesDto } from './credenciales.dto.js';

export class VincularTelegramDto extends CredencialesDto {
  @IsString()
  @IsNotEmpty({ message: 'El telegramId es requerido' })
  telegramId: string;
}
