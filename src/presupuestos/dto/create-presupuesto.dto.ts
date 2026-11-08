import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';

/** Alta o actualización de un presupuesto mensual por categoría (F5). */
export class CreatePresupuestoDto {
  @IsString()
  @IsNotEmpty({ message: 'El telegramId es obligatorio' })
  telegramId: string;

  @IsInt({ message: 'categoriaId debe ser un entero' })
  @IsPositive({ message: 'categoriaId debe ser mayor a 0' })
  categoriaId: number;

  @IsNumber({}, { message: 'monto debe ser un número' })
  @IsPositive({ message: 'monto debe ser mayor a 0' })
  monto: number;

  @IsInt({ message: 'mes debe ser un entero' })
  @Min(1, { message: 'mes debe estar entre 1 y 12' })
  @Max(12, { message: 'mes debe estar entre 1 y 12' })
  mes: number;

  @IsInt({ message: 'anio debe ser un entero' })
  @Min(2000, { message: 'anio debe ser mayor o igual a 2000' })
  anio: number;
}
