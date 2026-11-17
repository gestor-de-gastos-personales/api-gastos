import { esFechaISO, esOpcional, estaEnLista } from '../../common/validadores.js';

import type { AgrupacionSerie } from '../gastos.types.js';

/** Filtro de la serie temporal: fechas ISO y agrupación. */
export class SerieQueryDto {
  @esOpcional()
  @esFechaISO()
  desde?: string;

  @esOpcional()
  @esFechaISO()
  hasta?: string;

  @esOpcional()
  @estaEnLista(['dia', 'semana', 'mes'])
  agrupacion?: AgrupacionSerie;
}
