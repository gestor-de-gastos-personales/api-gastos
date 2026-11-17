import * as nj from '../../common/nest.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { UsuariosGastosService } from './usuarios-gastos.service.js';
import { CategoriasResolverService } from './categorias-resolver.service.js';
import type { FilterUltimosDto } from '../dto/filter-ultimos.dto.js';
import type { OpcionesResumen } from '../gastos.types.js';
import * as fechas from '../utils/fechas.js';
import type { GastoWhere } from './gastos-listado.service.js';

const noEncontrado = (mensaje: string) => new nj.noEncontrado(mensaje);

/** Filtros admitidos por el listado de últimos gastos del bot. */
export type FiltrosUltimos = Pick<
  FilterUltimosDto,
  'limit' | 'page' | 'categoria' | 'desde' | 'hasta'
> &
  Pick<OpcionesResumen, 'rango'>;

/**
 * Consultas del bot: últimos gastos paginados y búsqueda del último gasto
 * que coincide con los filtros. Separado del listado web para que cada
 * unidad tenga una responsabilidad acotada.
 */
@nj.injectable()
export class GastosUltimosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usuarios: UsuariosGastosService,
    private readonly categorias: CategoriasResolverService,
  ) {}

  /**
   * Lista los últimos gastos con paginación y filtros opcionales.
   * `limit` se acota a 50 para no exponer listados gigantes al bot.
   */
  async getUltimos(
    usuarioIdentifier: number | string,
    filtro: FiltrosUltimos = {},
  ) {
    const usuarioId = await this.usuarios.buscarUsuarioId(usuarioIdentifier);
    const limit = Math.min(Number(filtro.limit ?? 10) || 10, 50);
    const page = Math.max(Number(filtro.page ?? 1) || 1, 1);

    // Un usuario desconocido no tiene gastos: se responde una página vacía
    // en lugar de un 404 para que el bot muestre su estado vacío.
    if (usuarioId === null) {
      return {
        data: [],
        meta: { total: 0, page, limit, totalPages: 0 },
      };
    }

    const where = await this.whereUltimos(usuarioId, filtro);

    const [data, total] = await this.prisma.$transaction([
      this.prisma.gasto.findMany({
        where,
        include: { categoria: true },
        orderBy: { fecha: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.gasto.count({ where }),
    ]);

    return {
      data: data.map((gasto) => fechas.conFechaFormateada(gasto)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /** Traduce los filtros del bot (categoría por nombre, fechas ISO). */
  private async whereUltimos(
    usuarioId: number,
    filtro: FiltrosUltimos,
  ): Promise<GastoWhere> {
    const where: GastoWhere = { usuarioId };

    if (filtro.desde || filtro.hasta) {
      where.fecha = {
        ...(filtro.desde && { gte: fechas.parseFechaISO(filtro.desde, false) }),
        ...(filtro.hasta && { lte: fechas.parseFechaISO(filtro.hasta, true) }),
      };
    }

    if (filtro.categoria) {
      const categoria = await this.categorias.buscarCategoriaPorNombre(
        filtro.categoria,
      );
      // Categoría inexistente: no hay resultados posibles, se filtra por -1.
      where.categoriaId = categoria ? categoria.id : -1;
    }

    return where;
  }

  /**
   * Devuelve el último gasto que coincide con los filtros indicados.
   * `comercio` filtra por descripción sin distinguir mayúsculas.
   */
  async getUltimoGasto(
    usuarioIdentifier: number | string,
    dto: {
      telegramId?: string;
      comercio?: string;
      categoria?: string;
      desde?: string;
    },
  ) {
    const usuarioId = await this.usuarios.obtenerOCrearUsuarioId(
      usuarioIdentifier,
      dto.telegramId,
    );

    const where: GastoWhere = { usuarioId };

    if (dto.desde) {
      where.fecha = { gte: fechas.parseFechaISO(dto.desde, false) };
    }

    if (dto.categoria) {
      const categoria = await this.categorias.buscarCategoriaPorNombre(
        dto.categoria,
      );
      if (categoria) where.categoriaId = categoria.id;
    }

    const gastos = await this.prisma.gasto.findMany({
      where,
      include: { categoria: true, usuario: true },
      orderBy: { fecha: 'desc' },
      take: 50,
    });

    let encontrado = gastos[0] ?? null;

    if (dto.comercio && encontrado) {
      const comercio = dto.comercio.toLowerCase();
      const filtrado = gastos.find((gasto) =>
        (gasto.descripcion ?? '').toLowerCase().includes(comercio),
      );
      if (filtrado) encontrado = filtrado;
    }

    if (!encontrado) {
      throw noEncontrado('no se encontró ningún gasto para esos filtros');
    }

    return encontrado;
  }
}
