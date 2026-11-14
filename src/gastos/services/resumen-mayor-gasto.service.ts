import * as nest from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { GastoWhere } from './gastos-listado.service.js';
import type * as tipos from '../gastos.types.js';

/** Gasto de mayor monto del período consultado. */
@nest.Injectable()
export class ResumenMayorGastoService {
  constructor(private readonly prisma: PrismaService) {}

  /** Devuelve `null` cuando el período no tiene gastos. */
  async buscarMayorGasto(
    where: GastoWhere,
  ): Promise<tipos.MayorGastoResumen | null> {
    const gasto = await this.prisma.gasto.findFirst({
      where,
      include: { categoria: true },
      orderBy: { monto: 'desc' },
    });

    if (!gasto) return null;

    return {
      id: gasto.id,
      monto: Number(gasto.monto),
      descripcion: gasto.descripcion,
      fecha: gasto.fecha,
      categoria: gasto.categoria
        ? { id: gasto.categoria.id, nombre: gasto.categoria.nombre }
        : null,
    };
  }
}
