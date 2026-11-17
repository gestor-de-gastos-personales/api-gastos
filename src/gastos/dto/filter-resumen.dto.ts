import { esFechaISO, estaEnLista, esOpcional, esTexto } from '../../common/validadores.js';
import * as bot from './filter-resumen-bot.dto.js';
import * as validacion from '../../common/validacion.js';
import type * as tipos from '../gastos.types.js';

/**
 * Filtro del resumen web. Acepta mes/año, un rango predefinido o fechas
 * explícitas, y opcionalmente una categoría por nombre.
 */
export class FilterResumenDto {
  @esOpcional()
  @validacion.entero()
  @validacion.rango(1, 12)
  mes?: number;

  @esOpcional()
  @validacion.entero()
  @validacion.rango(2000, 2100)
  anio?: number;

  @esOpcional()
  @estaEnLista(bot.RANGOS_RESUMEN, { message: 'el rango solicitado no es válido' })
  rango?: tipos.RangoResumen;

  @esOpcional()
  @esFechaISO({}, { message: 'desde debe ser una fecha iso válida' })
  desde?: string;

  @esOpcional()
  @esFechaISO({}, { message: 'hasta debe ser una fecha iso válida' })
  hasta?: string;

  @esOpcional()
  @esTexto()
  categoria?: string;
}
