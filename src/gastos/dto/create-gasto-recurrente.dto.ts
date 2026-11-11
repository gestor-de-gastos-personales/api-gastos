import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { booleano, decimal, entero, rango } from '../../common/validacion.js';
import { FRECUENCIAS } from '../gastos.types.js';
import type { Frecuencia } from '../gastos.types.js';

export class CreateGastoRecurrenteDto {
  @IsNotEmpty()
  @entero()
  usuarioId!: number;

  @IsOptional()
  @IsString()
  telegramId?: string;

  @IsNotEmpty()
  @decimal()
  monto!: number;

  @IsOptional()
  @IsString()
  comercio?: string;

  @IsOptional()
  @entero()
  categoriaId?: number;

  @IsOptional()
  @IsString()
  categoria?: string;

  @IsNotEmpty()
  @IsString()
  descripcion!: string;

  @IsNotEmpty()
  @IsIn(FRECUENCIAS)
  frecuencia!: Frecuencia;

  @IsOptional()
  @entero()
  @rango(0, 6)
  diaSemana?: number;

  @IsOptional()
  @entero()
  @rango(1, 31)
  diaMes?: number;

  @IsOptional()
  @booleano()
  activo?: boolean;
}
