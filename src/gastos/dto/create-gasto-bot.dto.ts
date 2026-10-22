import {
  Allow,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

/**
 * Payload que envía el bot de Telegram a POST /gastos/bot.
 * Solo declara los campos que el bot utiliza; el resto de alias
 * se conservan en el servicio para los clientes web.
 */
export class CreateGastoBotDto {
  @IsString()
  @IsNotEmpty()
  telegramId: string;

  @Allow()
  monto?: number;

  @Allow()
  categoria?: string | number;

  @Allow()
  comercio?: string;

  @Allow()
  descripcion?: string;

  @IsOptional()
  @IsDateString({}, { message: 'fecha debe ser una fecha ISO válida' })
  fecha?: string;
}
