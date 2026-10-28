import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import type { RangoResumen } from '../gastos.types.js';

export const RANGOS_RESUMEN: RangoResumen[] = [
  'WEEK',
  '15_DAYS',
  'MONTH',
  '2_MONTHS',
  'YEAR',
];

/**
 * Filtro del resumen que consume el bot. Permite fechas explícitas
 * (`desde`/`hasta`) o un rango predefinido (`rango`).
 */
export class FilterResumenBotDto {
  @IsString()
  @IsNotEmpty({ message: 'El telegramId es obligatorio' })
  telegramId: string;

  @IsOptional()
  @IsDateString({}, { message: 'desde debe ser una fecha ISO válida' })
  desde?: string;

  @IsOptional()
  @IsDateString({}, { message: 'hasta debe ser una fecha ISO válida' })
  hasta?: string;

  @IsOptional()
  @IsIn(RANGOS_RESUMEN, { message: 'El rango solicitado no es válido' })
  rango?: RangoResumen;
}
