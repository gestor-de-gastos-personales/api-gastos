import { esEntero, esNumero, esPositivo, esRequerido, esTexto, minimo } from '../../common/validadores.js';

import { rango } from '../../common/validacion.js';

/** Alta o actualización de un presupuesto mensual por categoría (F5). */
export class CreatePresupuestoDto {
  @esTexto()
  @esRequerido({ message: 'el telegramId es obligatorio' })
  telegramId: string;

  @esEntero({ message: 'categoriaId debe ser un entero' })
  @esPositivo({ message: 'categoriaId debe ser mayor a 0' })
  categoriaId: number;

  @esNumero({}, { message: 'monto debe ser un número' })
  @esPositivo({ message: 'monto debe ser mayor a 0' })
  monto: number;

  @esEntero({ message: 'mes debe ser un entero' })
  @rango(1, 12)
  mes: number;

  @esEntero({ message: 'anio debe ser un entero' })
  @minimo(2000, { message: 'anio debe ser mayor o igual a 2000' })
  anio: number;
}
