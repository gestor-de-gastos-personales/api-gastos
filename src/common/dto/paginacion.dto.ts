import { esEntero, esOpcional, minimo } from '../validadores.js';

import { Type } from 'class-transformer';

/**
 * Parámetros de paginación reutilizables por los listados de la API.
 */
export class PaginacionDto {
  @esOpcional()
  @Type(() => Number)
  @esEntero()
  @minimo(1)
  page?: number = 1;

  @esOpcional()
  @Type(() => Number)
  @esEntero()
  @minimo(1)
  limit?: number = 10;
}
