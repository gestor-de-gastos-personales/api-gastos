import { esFechaISO, esOpcional, esRequerido, esTexto, minimo } from '../../common/validadores.js';

import { entero, rango } from '../../common/validacion.js';

/**
 * Filtro de `GET /gastos/ultimos`.
 *
 * `limit` se acota a 50 y `page` arranca en 1. Las fechas son ISO
 * (`YYYY-MM-DD`) y la categoría se resuelve por nombre.
 */
export class FilterUltimosDto {
  @esOpcional()
  @esTexto()
  telegramId?: string;

  @esOpcional()
  @esTexto()
  usuarioId?: string;

  @esOpcional()
  @entero()
  @rango(1, 50)
  limit?: number = 10;

  @esOpcional()
  @entero()
  @minimo(1, { message: 'page debe ser mayor o igual a 1' })
  page?: number = 1;

  @esOpcional()
  @esTexto()
  @esRequerido({ message: 'la categoría no puede estar vacía' })
  categoria?: string;

  @esOpcional()
  @esFechaISO({}, { message: 'desde debe ser una fecha iso válida' })
  desde?: string;

  @esOpcional()
  @esFechaISO({}, { message: 'hasta debe ser una fecha iso válida' })
  hasta?: string;
}
