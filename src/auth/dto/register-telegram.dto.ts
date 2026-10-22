import { IsOptional, IsString } from 'class-validator';
import { VincularTelegramDto } from './vincular-telegram.dto.js';

export class RegisterTelegramDto extends VincularTelegramDto {
  @IsOptional()
  @IsString()
  nombre?: string;
}
