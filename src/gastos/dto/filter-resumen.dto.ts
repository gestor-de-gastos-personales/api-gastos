import { IsOptional, IsInt, Min, Max, IsIn, IsDateString, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { RANGOS_RESUMEN } from './filter-resumen-bot.dto.js';
import type { RangoResumen } from '../gastos.types.js';

/**
 * Filtro del resumen web. Acepta mes/año, un rango predefinido o fechas
 * explícitas, y opcionalmente una categoría por nombre.
 */
export class FilterResumenDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  mes?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  anio?: number;

  @IsOptional()
  @IsIn(RANGOS_RESUMEN, { message: 'El rango solicitado no es válido' })
  rango?: RangoResumen;

  @IsOptional()
  @IsDateString({}, { message: 'desde debe ser una fecha ISO válida' })
  desde?: string;

  @IsOptional()
  @IsDateString({}, { message: 'hasta debe ser una fecha ISO válida' })
  hasta?: string;

  @IsOptional()
  @IsString()
  categoria?: string;
}
