import * as nest from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { GastoWhere } from './gastos-listado.service.js';
import type * as tipos from '../gastos.types.js';

interface GrupoCategoria {
  categoriaId: number;
  _sum: { monto: unknown } | null;
}

function sumarTotales(grupos: GrupoCategoria[]): number {
  return grupos.reduce(
    (acumulado, grupo) => acumulado + Number(grupo._sum?.monto || 0),
    0,
  );
}

function calcularPorcentaje(total: number, totalGeneral: number): number {
  if (totalGeneral <= 0) return 0;
  return Number(((total / totalGeneral) * 100).toFixed(2));
}

/**
 * Agrupación de gastos por categoría para el resumen.
 * Separado del orquestador para que cada unidad tenga una sola razón de cambio.
 */
@nest.Injectable()
export class ResumenAgrupadoService {
  constructor(private readonly prisma: PrismaService) {}

  private async obtenerNombresCategorias(ids: number[]) {
    const categorias = await this.prisma.categoria.findMany({
      where: { id: { in: ids } },
    });
    return new Map(
      categorias.map((categoria) => [categoria.id, categoria.nombre]),
    );
  }

  private formatearGrupo(
    grupo: GrupoCategoria,
    nombres: Map<number, string>,
    totalGeneral: number,
  ): tipos.GrupoResumen {
    const total = Number(grupo._sum?.monto || 0);

    return {
      categoriaId: grupo.categoriaId,
      categoriaNombre: nombres.get(grupo.categoriaId) || 'Sin categoría',
      total,
      porcentaje: calcularPorcentaje(total, totalGeneral),
    };
  }

  async agruparPorCategoria(where: GastoWhere) {
    const agrupado = await this.prisma.gasto.groupBy({
      by: ['categoriaId'],
      _sum: { monto: true },
      where,
    });
    const nombres = await this.obtenerNombresCategorias(
      agrupado.map((item) => item.categoriaId),
    );
    const totalGeneral = sumarTotales(agrupado);

    return {
      totalGeneral,
      porCategoria: agrupado.map((item) =>
        this.formatearGrupo(item, nombres, totalGeneral),
      ),
    };
  }
}
