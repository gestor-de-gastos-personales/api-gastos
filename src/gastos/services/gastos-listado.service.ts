import * as nest from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { UsuariosGastosService } from './usuarios-gastos.service.js';
import { FilterGastosDto } from '../dto/filter-gasto.dto.js';
import * as fechas from '../utils/fechas.js';

/** Filtro mínimo que consumen las consultas de gastos. */
export interface GastoWhere {
  usuarioId: number;
  fecha?: { gte?: Date; lte?: Date };
  categoriaId?: number;
}

const noEncontrado = (mensaje: string) => new nest.NotFoundException(mensaje);

/**
 * Listado y detalle de gastos. No conoce los filtros del bot ni el resumen:
 * cada caso de uso vive en su propio servicio.
 */
@nest.Injectable()
export class GastosListadoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usuarios: UsuariosGastosService,
  ) {}

  /** Construye el `where` del listado web (fechas en `DD-MM-YYYY`). */
  construirWhere(usuarioId: number, filtro?: FilterGastosDto): GastoWhere {
    const { fechaInicio, fechaFin, categoriaId } = filtro || {};
    const where: GastoWhere = { usuarioId };

    if (fechaInicio || fechaFin) {
      where.fecha = {
        ...(fechaInicio && { gte: fechas.parseFechaArg(fechaInicio) }),
        ...(fechaFin && { lte: fechas.parseFechaArg(fechaFin, true) }),
      };
    }

    if (categoriaId) {
      where.categoriaId = Number(categoriaId);
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
      data: data.map((gasto) => fechas.conFechaFormateada(gasto)),
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
    return fechas.conFechaFormateada(gasto);
  }

  async getGastoById(usuarioIdentifier: number | string, id: number) {
    const usuarioId = await this.usuarios.resolverUsuarioId(usuarioIdentifier);
    return this.buscarGasto(usuarioId, id);
  }
}
