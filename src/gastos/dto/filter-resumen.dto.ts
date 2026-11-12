import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator';
import { RANGOS_RESUMEN } from './filter-resumen-bot.dto.js';
import { entero, rango } from '../../common/validacion.js';
import type { RangoResumen } from '../gastos.types.js';

/**
 * Filtro del resumen web. Acepta mes/año, un rango predefinido o fechas
 * explícitas, y opcionalmente una categoría por nombre.
 */
export class FilterResumenDto {
  @IsOptional()
  @entero()
  @rango(1, 12)
  mes?: number;

  @IsOptional()
  @entero()
  @rango(2000, 2100)
  anio?: number;

  @IsOptional()
  @IsIn(RANGOS_RESUMEN, { message: 'el rango solicitado no es válido' })
  rango?: RangoResumen;

  @IsOptional()
  @IsDateString({}, { message: 'desde debe ser una fecha iso válida' })
  desde?: string;

  @IsOptional()
  @IsDateString({}, { message: 'hasta debe ser una fecha iso válida' })
  hasta?: string;

  @IsOptional()
  @IsString()
  categoria?: string;
}
