import { PartialType } from '@nestjs/mapped-types';
import { CreateGastoRecurrenteDto } from './create-gasto-recurrente.dto.js';

/** Actualización parcial de un gasto recurrente (todos los campos opcionales). */
export class UpdateGastoRecurrenteDto extends PartialType(
  CreateGastoRecurrenteDto,
) {}
