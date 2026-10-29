import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { UsuariosGastosService } from './usuarios-gastos.service.js';
import type {
  GastoWhere,
} from './gastos-consulta.service.js';
import type {
  GrupoResumen,
  MayorGastoResumen,
  OpcionesResumen,
  ResumenGastos,
} from '../gastos.types.js';
import { resolverPeriodo } from '../utils/fechas.js';

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
 * Cálculo de resúmenes por período: total, desglose por categoría y
 * gasto más grande del rango consultado.
 */
@Injectable()
export class GastosResumenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usuarios: UsuariosGastosService,
  ) {}

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
  ): GrupoResumen {
    const total = Number(grupo._sum?.monto || 0);

    return {
      categoriaId: grupo.categoriaId,
      categoriaNombre: nombres.get(grupo.categoriaId) || 'Sin categoría',
      total,
      porcentaje: calcularPorcentaje(total, totalGeneral),
    };
  }

  private async agruparPorCategoria(where: GastoWhere) {
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

  /** Gasto de mayor monto del período; `null` cuando no hay gastos. */
  private async buscarMayorGasto(where: GastoWhere): Promise<MayorGastoResumen | null> {
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

  /** Traduce el filtro por nombre de categoría a un `categoriaId`. */
  private async resolverFiltroCategoria(
    categoria?: string,
  ): Promise<number | undefined> {
    if (!categoria) return undefined;

    const encontrada = await this.usuarios.buscarCategoriaPorNombre(categoria);
    // Categoría inexistente: se fuerza un id imposible para devolver vacío.
    return encontrada ? encontrada.id : -1;
  }

  async getResumen(
    usuarioIdentifier: number | string,
    filtro: OpcionesResumen = {},
  ): Promise<ResumenGastos> {
    const usuarioId = await this.usuarios.obtenerOCrearUsuarioId(
      usuarioIdentifier,
    );
    const periodo = resolverPeriodo(filtro);
    const categoriaId = await this.resolverFiltroCategoria(filtro.categoria);

    const where: GastoWhere = {
      usuarioId,
      fecha: { gte: periodo.fechaInicio, lte: periodo.fechaFin },
      ...(categoriaId !== undefined && { categoriaId }),
    };

    const agrupado = await this.agruparPorCategoria(where);
    const mayorGasto = await this.buscarMayorGasto(where);
    const cantidad = await this.prisma.gasto.count({ where });

    return { periodo, ...agrupado, mayorGasto, cantidad };
  }
}
