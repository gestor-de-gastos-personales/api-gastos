import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { entero, rango } from '../../common/validacion.js';

/**
 * Filtro de `GET /gastos/ultimos`.
 *
 * `limit` se acota a 50 y `page` arranca en 1. Las fechas son ISO
 * (`YYYY-MM-DD`) y la categoría se resuelve por nombre.
 */
export class FilterUltimosDto {
  @IsOptional()
  @IsString()
  telegramId?: string;

  @IsOptional()
  @IsString()
  usuarioId?: string;

  @IsOptional()
  @entero()
  @rango(1, 50)
  limit?: number = 10;

  @IsOptional()
  @entero()
  @Min(1, { message: 'page debe ser mayor o igual a 1' })
  page?: number = 1;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'la categoría no puede estar vacía' })
  categoria?: string;

  @IsOptional()
  @IsDateString({}, { message: 'desde debe ser una fecha iso válida' })
  desde?: string;

  @IsOptional()
  @IsDateString({}, { message: 'hasta debe ser una fecha iso válida' })
  hasta?: string;
}
