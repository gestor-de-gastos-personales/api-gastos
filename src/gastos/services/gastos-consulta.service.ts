import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { UsuariosGastosService } from './usuarios-gastos.service.js';
import { FilterGastosDto } from '../dto/filter-gasto.dto.js';
import type { FilterUltimosDto } from '../dto/filter-ultimos.dto.js';
import type { OpcionesResumen } from '../gastos.types.js';
import { conFechaFormateada, parseFechaArg, parseFechaISO } from '../utils/fechas.js';

/** Filtro mínimo que consumen las consultas de gastos. */
export interface GastoWhere {
  usuarioId: number;
  fecha?: { gte?: Date; lte?: Date };
  categoriaId?: number;
  monto?: { gte?: number; lte?: number };
}

const noEncontrado = (mensaje: string) => new NotFoundException(mensaje);

/** Filtros admitidos por el listado de últimos gastos del bot. */
export type FiltrosUltimos = Pick<
  FilterUltimosDto,
  'limit' | 'page' | 'categoria' | 'desde' | 'hasta'
> &
  Pick<OpcionesResumen, 'rango'>;

/**
 * Consultas de lectura de gastos: listados, detalle, último gasto y
 * búsqueda por id. No muta datos.
 */
@Injectable()
export class GastosConsultaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usuarios: UsuariosGastosService,
  ) {}

  /** Construye el `where` del listado web (fechas en `DD-MM-YYYY`). */
  construirWhere(usuarioId: number, filtro?: FilterGastosDto): GastoWhere {
    const { fechaInicio, fechaFin, categoriaId, montoMin, montoMax } =
      filtro || {};
    const where: GastoWhere = { usuarioId };

    if (fechaInicio || fechaFin) {
      where.fecha = {
        ...(fechaInicio && { gte: parseFechaArg(fechaInicio) }),
        ...(fechaFin && { lte: parseFechaArg(fechaFin, true) }),
      };
    }

    if (categoriaId) {
      where.categoriaId = Number(categoriaId);
    }

    if (montoMin !== undefined || montoMax !== undefined) {
      where.monto = {
        ...(montoMin !== undefined && { gte: Number(montoMin) }),
        ...(montoMax !== undefined && { lte: Number(montoMax) }),
      };
    }

    return where;
  }

  async findAll(usuarioId: number, filtro?: FilterGastosDto) {
    const { page = 1, limit = 10 } = filtro || {};
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const where = this.construirWhere(usuarioId, filtro);

    const [data, total] = await this.prisma.$transaction([
      this.prisma.gasto.findMany({
        where,
        include: { categoria: true },
        orderBy: { fecha: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      this.prisma.gasto.count({ where }),
    ]);

    return {
      data: data.map((gasto) => conFechaFormateada(gasto)),
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  /** Busca un gasto del usuario o lanza 404 (evita filtrar datos ajenos). */
  async buscarGasto(usuarioId: number, id: number) {
    const gasto = await this.prisma.gasto.findFirst({
      where: { id, usuarioId },
      include: { categoria: true },
    });

    if (!gasto) {
      throw noEncontrado(`Gasto con ID #${id} no encontrado`);
    }

    return gasto;
  }

  async findOne(usuarioId: number, id: number) {
    const gasto = await this.buscarGasto(usuarioId, id);
    return conFechaFormateada(gasto);
  }

  /**
   * Lista los últimos gastos con paginación y filtros opcionales.
   * `limit` se acota a 50 para no exponer listados gigantes al bot.
   */
  async getUltimos(usuarioIdentifier: number | string, filtro: FiltrosUltimos = {}) {
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
      data: data.map((gasto) => conFechaFormateada(gasto)),
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
        ...(filtro.desde && { gte: parseFechaISO(filtro.desde, false) }),
        ...(filtro.hasta && { lte: parseFechaISO(filtro.hasta, true) }),
      };
    }

    if (filtro.categoria) {
      const categoria = await this.usuarios.buscarCategoriaPorNombre(
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
      where.fecha = { gte: parseFechaISO(dto.desde, false) };
    }

    if (dto.categoria) {
      const categoria = await this.usuarios.buscarCategoriaPorNombre(
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
      throw noEncontrado('No se encontró ningún gasto para esos filtros');
    }

    return encontrado;
  }

  async getGastoById(usuarioIdentifier: number | string, id: number) {
    const usuarioId = await this.usuarios.resolverUsuarioId(usuarioIdentifier);
    return this.buscarGasto(usuarioId, id);
  }
}
