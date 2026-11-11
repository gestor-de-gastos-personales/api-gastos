import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { rango } from '../../common/validacion.js';

/** Alta o actualización de un presupuesto mensual por categoría (F5). */
export class CreatePresupuestoDto {
  @IsString()
  @IsNotEmpty({ message: 'el telegramId es obligatorio' })
  telegramId: string;

  @IsInt({ message: 'categoriaId debe ser un entero' })
  @IsPositive({ message: 'categoriaId debe ser mayor a 0' })
  categoriaId: number;

  @IsNumber({}, { message: 'monto debe ser un número' })
  @IsPositive({ message: 'monto debe ser mayor a 0' })
  monto: number;

  @IsInt({ message: 'mes debe ser un entero' })
  @rango(1, 12)
  mes: number;

  @IsInt({ message: 'anio debe ser un entero' })
  @Min(2000, { message: 'anio debe ser mayor o igual a 2000' })
  anio: number;
}
