import { esEntero, esNumero, esPositivo, minimo } from '../../common/validadores.js';
import { Max } from 'class-validator';

/** Presupuesto mensual creado desde la web (usuario autenticado). */
export class PresupuestoMioDto {
  @esEntero({ message: 'categoriaId debe ser un entero' })
  @esPositivo({ message: 'categoriaId debe ser mayor a 0' })
  categoriaId: number;

  @esNumero({}, { message: 'monto debe ser un número' })
  @esPositivo({ message: 'monto debe ser mayor a 0' })
  monto: number;

  @esEntero({ message: 'mes debe ser un entero' })
  @minimo(1)
  @Max(12)
  mes: number;

  @esEntero({ message: 'anio debe ser un entero' })
  @minimo(2000)
  anio: number;
}
