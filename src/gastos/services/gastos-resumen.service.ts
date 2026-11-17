import * as nj from '../../common/nest.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { UsuariosGastosService } from './usuarios-gastos.service.js';
import { CategoriasResolverService } from './categorias-resolver.service.js';
import { ResumenAgrupadoService } from './resumen-agrupado.service.js';
import { ResumenMayorGastoService } from './resumen-mayor-gasto.service.js';
import type * as f from '../tipos-facade.js';
import * as fechas from '../utils/fechas.js';

/**
 * Orquesta el resumen por período: resuelve el usuario y el rango, y delega
 * la agrupación por categoría y la búsqueda del mayor gasto.
 */
@nj.injectable()
export class GastosResumenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usuarios: UsuariosGastosService,
    private readonly categorias: CategoriasResolverService,
    private readonly agrupado: ResumenAgrupadoService,
    private readonly mayorGasto: ResumenMayorGastoService,
  ) {}

  /** Traduce el filtro por nombre de categoría a un `categoriaId`. */
  private async resolverFiltroCategoria(
    categoria?: string,
  ): Promise<number | undefined> {
    if (!categoria) return undefined;

    const encontrada = await this.categorias.buscarCategoriaPorNombre(categoria);
    // Categoría inexistente: se fuerza un id imposible para devolver vacío.
    return encontrada ? encontrada.id : -1;
  }

  async getResumen(
    usuarioIdentifier: number | string,
    filtro: f.opcionesResumen = {},
  ): Promise<f.resumenGastos> {
    const usuarioId = await this.usuarios.obtenerOCrearUsuarioId(
      usuarioIdentifier,
    );
    const periodo = fechas.resolverPeriodo(filtro);
    const categoriaId = await this.resolverFiltroCategoria(filtro.categoria);

    const where: f.whereGasto = {
      usuarioId,
      fecha: { gte: periodo.fechaInicio, lte: periodo.fechaFin },
      ...(categoriaId !== undefined && { categoriaId }),
    };

    const agrupado = await this.agrupado.agruparPorCategoria(where);
    const mayorGasto = await this.mayorGasto.buscarMayorGasto(where);
    const cantidad = await this.prisma.gasto.count({ where });

    return { periodo, ...agrupado, mayorGasto, cantidad };
  }
}
