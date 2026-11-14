import * as cv from 'class-validator';
import * as bot from './filter-resumen-bot.dto.js';
import * as validacion from '../../common/validacion.js';
import type * as tipos from '../gastos.types.js';

/**
 * Filtro del resumen web. Acepta mes/año, un rango predefinido o fechas
 * explícitas, y opcionalmente una categoría por nombre.
 */
export class FilterResumenDto {
  @cv.IsOptional()
  @validacion.entero()
  @validacion.rango(1, 12)
  mes?: number;

  @cv.IsOptional()
  @validacion.entero()
  @validacion.rango(2000, 2100)
  anio?: number;

  @cv.IsOptional()
  @cv.IsIn(bot.RANGOS_RESUMEN, { message: 'el rango solicitado no es válido' })
  rango?: tipos.RangoResumen;

  @cv.IsOptional()
  @cv.IsDateString({}, { message: 'desde debe ser una fecha iso válida' })
  desde?: string;

  @cv.IsOptional()
  @cv.IsDateString({}, { message: 'hasta debe ser una fecha iso válida' })
  hasta?: string;

  @cv.IsOptional()
  @cv.IsString()
  categoria?: string;
}
