import { Allow, IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

/**
 * Actualización parcial de un gasto.
 *
 * Acepta los alias que usa el bot (`monto`, `comercio`, `valor`, …) además de
 * los campos del contrato web. Todos los campos son opcionales: el servicio
 * solo escribe los que llegan.
 */
export class UpdateGastoDto {
  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsNumber()
  valor?: number;

  @IsOptional()
  @IsDateString({}, { message: 'fecha debe ser una fecha ISO válida' })
  fecha?: string;

  @IsOptional()
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
