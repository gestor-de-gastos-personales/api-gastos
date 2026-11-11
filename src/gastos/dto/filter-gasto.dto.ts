import { IsOptional, Matches } from 'class-validator';
import { PaginacionDto } from '../../common/dto/paginacion.dto.js';
import { entero } from '../../common/validacion.js';

const FORMATO_FECHA = /^([0-2][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/;

export class FilterGastosDto extends PaginacionDto {
  @IsOptional()
  @Matches(FORMATO_FECHA, {
    message: 'fechaInicio debe tener el formato dd-mm-yyyy (ej: 01-10-2026)',
  })
  fechaInicio?: string;

  @IsOptional()
  @Matches(FORMATO_FECHA, {
    message: 'fechaFin debe tener el formato dd-mm-yyyy (ej: 31-10-2026)',
  })
  fechaFin?: string;

  @IsOptional()
  @entero()
  categoriaId?: number;
}
