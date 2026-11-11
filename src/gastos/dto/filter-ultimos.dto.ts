import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

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
  @Type(() => Number)
  @IsInt({ message: 'limit debe ser un número entero' })
  @Min(1, { message: 'limit debe ser mayor o igual a 1' })
  @Max(50, { message: 'limit no puede superar 50' })
  limit?: number = 10;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page debe ser un número entero' })
  @Min(1, { message: 'page debe ser mayor o igual a 1' })
  page?: number = 1;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'La categoría no puede estar vacía' })
  categoria?: string;

  @IsOptional()
  @IsDateString({}, { message: 'desde debe ser una fecha ISO válida' })
  desde?: string;

  @IsOptional()
  @IsDateString({}, { message: 'hasta debe ser una fecha ISO válida' })
  hasta?: string;
}
