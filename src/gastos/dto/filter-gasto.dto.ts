import { IsOptional, Matches, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginacionDto } from '../../common/dto/paginacion.dto.js';

const FORMATO_FECHA = /^([0-2][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/;

export class FilterGastosDto extends PaginacionDto {
  @IsOptional()
  @Matches(FORMATO_FECHA, {
    message: 'fechaInicio debe tener el formato DD-MM-YYYY (ej: 01-10-2026)',
  })
  fechaInicio?: string;

  @IsOptional()
  @Matches(FORMATO_FECHA, {
    message: 'fechaFin debe tener el formato DD-MM-YYYY (ej: 31-10-2026)',
  })
  fechaFin?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'categoriaId debe ser un número entero' })
  categoriaId?: number;
}
