import * as cv from 'class-validator';
import * as validacion from '../../common/validacion.js';
import * as tipos from '../gastos.types.js';

export class CreateGastoRecurrenteDto {
  @cv.IsNotEmpty()
  @validacion.entero()
  usuarioId!: number;

  @cv.IsOptional()
  @cv.IsString()
  telegramId?: string;

  @cv.IsNotEmpty()
  @validacion.decimal()
  monto!: number;

  @cv.IsOptional()
  @cv.IsString()
  comercio?: string;

  @cv.IsOptional()
  @validacion.entero()
  categoriaId?: number;

  @cv.IsOptional()
  @cv.IsString()
  categoria?: string;

  @cv.IsNotEmpty()
  @cv.IsString()
  descripcion!: string;

  @cv.IsNotEmpty()
  @cv.IsIn(tipos.FRECUENCIAS)
  frecuencia!: tipos.Frecuencia;

  @cv.IsOptional()
  @validacion.entero()
  @validacion.rango(0, 6)
  diaSemana?: number;

  @cv.IsOptional()
  @validacion.entero()
  @validacion.rango(1, 31)
  diaMes?: number;

  @cv.IsOptional()
  @validacion.booleano()
  activo?: boolean;
}
