import { Allow, IsNotEmpty, IsString } from 'class-validator';

/**
 * Payload que envía el bot de Telegram a POST /gastos/bot.
 * Los campos opcionales se aceptan con sus alias para no romper
 * la integración existente.
 */
export class CreateGastoBotDto {
  @IsString()
  @IsNotEmpty()
  telegramId: string;

  @Allow()
  usuarioId?: number;

  @Allow()
  monto?: number;

  @Allow()
  valor?: number;

  @Allow()
  total?: number;

  @Allow()
  categoria?: string | number;

  @Allow()
  category?: string;

  @Allow()
  comercio?: string;

  @Allow()
  merchant?: string;

  @Allow()
  descripcion?: string;

  @Allow()
  description?: string;

  @Allow()
  fecha?: string;
}
