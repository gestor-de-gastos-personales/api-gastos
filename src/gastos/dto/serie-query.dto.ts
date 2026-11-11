import { IsDateString, IsIn, IsOptional } from 'class-validator';
import type { AgrupacionSerie } from '../gastos.types.js';

/** Filtro de la serie temporal: fechas ISO y agrupación. */
export class SerieQueryDto {
  @IsOptional()
  @IsDateString()
  desde?: string;

  @IsOptional()
  @IsDateString()
  hasta?: string;

  @IsOptional()
  @IsIn(['dia', 'semana', 'mes'])
  agrupacion?: AgrupacionSerie;
}
