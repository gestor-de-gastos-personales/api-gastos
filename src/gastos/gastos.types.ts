/**
 * Identificador de usuario aceptado por la capa de servicios:
 * el id numérico interno o el telegramId del bot.
 */
export type UsuarioIdentificador = number | string;

/**
 * Entrada normalizada para crear un gasto. Acepta los alias que usan
 * tanto la API web como el bot de Telegram.
 */
export interface GastoInput {
  descripcion?: string;
  description?: string;
  valor?: number;
  monto?: number;
  total?: number;
  fecha?: string;
  categoria?: string | number;
  category?: string;
  comercio?: string;
  merchant?: string;
  telegramId?: string;
}
