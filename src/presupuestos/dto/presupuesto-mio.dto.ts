import { IsInt, IsNumber, IsPositive, Max, Min } from 'class-validator';

/** Presupuesto mensual creado desde la web (usuario autenticado). */
export class PresupuestoMioDto {
  @IsInt({ message: 'categoriaId debe ser un entero' })
  @IsPositive({ message: 'categoriaId debe ser mayor a 0' })
  categoriaId: number;

  @IsNumber({}, { message: 'monto debe ser un número' })
  @IsPositive({ message: 'monto debe ser mayor a 0' })
  monto: number;

  @IsInt({ message: 'mes debe ser un entero' })
  @Min(1)
  @Max(12)
  mes: number;

  @IsInt({ message: 'anio debe ser un entero' })
  @Min(2000)
  anio: number;
}
