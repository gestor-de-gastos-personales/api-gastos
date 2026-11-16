import { esFechaISO, esNumero, esOpcional, esTexto } from '../../common/validadores.js';
import { Allow } from 'class-validator';

/**
 * Actualización parcial de un gasto.
 *
 * Acepta los alias que usa el bot (`monto`, `comercio`, `valor`, …) además de
 * los campos del contrato web. Todos los campos son opcionales: el servicio
 * solo escribe los que llegan.
 */
export class UpdateGastoDto {
  @esOpcional()
  @esTexto()
  descripcion?: string;

  @esOpcional()
  @esNumero()
  valor?: number;

  @esOpcional()
  @esFechaISO({}, { message: 'fecha debe ser una fecha ISO válida' })
  fecha?: string;

  @esOpcional()
  @Allow()
  categoria?: string | number;

  @Allow()
  description?: string;

  @Allow()
  monto?: number;

  @Allow()
  total?: number;

  @Allow()
  amount?: number;

  @Allow()
  categoriaId?: number;

  @Allow()
  category?: string;

  @Allow()
  comercio?: string;

  @Allow()
  merchant?: string;

  @Allow()
  date?: string;
}
