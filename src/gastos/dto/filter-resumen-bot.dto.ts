import { esFechaISO, esOpcional, esRequerido, esTexto, estaEnLista } from '../../common/validadores.js';

import type { RangoResumen } from '../gastos.types.js';

export const RANGOS_RESUMEN: RangoResumen[] = [
  'TODAY',
  'WEEK',
  '15_DAYS',
  'MONTH',
  '2_MONTHS',
  'YEAR',
];

/**
 * Filtro del resumen que consume el bot. Permite fechas explícitas
 * (`desde`/`hasta`) o un rango predefinido (`rango`), y filtrar por
 * categoría por nombre.
 */
export class FilterResumenBotDto {
  @esTexto()
  @esRequerido({ message: 'el telegramId es obligatorio' })
  telegramId: string;

  @esOpcional()
  @esFechaISO({}, { message: 'desde debe ser una fecha iso válida' })
  desde?: string;

  @esOpcional()
  @esFechaISO({}, { message: 'hasta debe ser una fecha iso válida' })
  hasta?: string;

  @esOpcional()
  @estaEnLista(RANGOS_RESUMEN, { message: 'el rango solicitado no es válido' })
  rango?: RangoResumen;

  @esOpcional()
  @esTexto()
  @esRequerido({ message: 'la categoría no puede estar vacía' })
  categoria?: string;
}
