import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateGastoDto } from '../dto/update-gasto.dto.js';
import { FilterGastosDto } from '../dto/filter-gasto.dto.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import type {
  GastoInput,
  OpcionesResumen,
  PeriodoResumen,
  RangoResumen,
} from '../gastos.types.js';

/** Filtro mínimo que consumen las consultas de gastos. */
interface GastoWhere {
  usuarioId: number;
  fecha?: { gte?: Date; lte?: Date };
  categoriaId?: number;
}

interface GrupoCategoria {
  categoriaId: number;
  _sum: { monto: unknown } | null;
}

const noEncontrado = (mensaje: string) => new NotFoundException(mensaje);

@Injectable()
export class GastosService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Convierte fechas ISO (`YYYY-MM-DD`) o el formato legado
   * (`DD-MM-YYYY`) a un Date en UTC.
   */
  private parseFechaArg(fechaStr: string, esFinDeDia = false): Date {
    const hora = esFinDeDia ? '23:59:59.999Z' : '00:00:00.000Z';
    const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fechaStr);

    if (iso) {
      return new Date(`${iso[1]}-${iso[2]}-${iso[3]}T${hora}`);
    }

    const [dia, mes, anio] = fechaStr.split('-');
    return new Date(`${anio}-${mes}-${dia}T${hora}`);
  }

  /** Convierte una fecha ISO completa o `YYYY-MM-DD`. */
  private parseFechaISO(valor: string, esFinDeDia: boolean): Date {
    const fecha = new Date(valor);

    if (Number.isNaN(fecha.getTime())) {
      throw new BadRequestException(`La fecha '${valor}' no es válida`);
    }

    if (esFinDeDia && /^\d{4}-\d{2}-\d{2}$/.test(valor)) {
      fecha.setUTCHours(23, 59, 59, 999);
    }

    return fecha;
  }

  private resolverPeriodo(opciones: OpcionesResumen): PeriodoResumen {
    if (opciones.desde || opciones.hasta) {
      return this.periodoExplicito(opciones);
    }

    if (opciones.rango) {
      return this.periodoPorRango(opciones.rango);
    }

    return this.periodoPorMes(opciones);
  }

  private periodoExplicito(opciones: OpcionesResumen): PeriodoResumen {
    const fechaInicio = opciones.desde
      ? this.parseFechaISO(opciones.desde, false)
      : new Date(Date.UTC(2000, 0, 1));
    const fechaFin = opciones.hasta
      ? this.parseFechaISO(opciones.hasta, true)
      : new Date();

    if (fechaInicio > fechaFin) {
      throw new BadRequestException(
        'La fecha desde no puede ser posterior a la fecha hasta',
      );
    }

    return {
      mes: null,
      anio: fechaFin.getUTCFullYear(),
      rango: null,
      fechaInicio,
      fechaFin,
    };
  }

  private periodoPorRango(rango: RangoResumen): PeriodoResumen {
    const ahora = new Date();

    return {
      mes: null,
      anio: ahora.getUTCFullYear(),
      rango,
      fechaInicio: this.inicioDelRango(rango, ahora),
      fechaFin: ahora,
    };
  }

  /** Calcula el inicio de cada rango soportado sin anidar condicionales. */
  private inicioDelRango(rango: RangoResumen, ahora: Date): Date {
    const anio = ahora.getUTCFullYear();
    const mes = ahora.getUTCMonth();
    const dia = ahora.getUTCDate();
    const diasDesdeLunes = (ahora.getUTCDay() + 6) % 7;

    const inicios: Record<RangoResumen, Date> = {
      WEEK: new Date(Date.UTC(anio, mes, dia - diasDesdeLunes)),
      '15_DAYS': new Date(Date.UTC(anio, mes, dia - 14)),
      MONTH: new Date(Date.UTC(anio, mes, 1)),
      '2_MONTHS': new Date(Date.UTC(anio, mes - 2, dia)),
      YEAR: new Date(Date.UTC(anio, 0, 1)),
    };

    return inicios[rango];
  }

  private periodoPorMes(opciones: OpcionesResumen): PeriodoResumen {
    const ahora = new Date();
    const anio = opciones.anio ? Number(opciones.anio) : ahora.getFullYear();
    const mes = opciones.mes ? Number(opciones.mes) : undefined;

    if (mes) {
      return {
        mes,
        anio,
        rango: null,
        fechaInicio: new Date(Date.UTC(anio, mes - 1, 1)),
        fechaFin: new Date(Date.UTC(anio, mes, 0, 23, 59, 59, 999)),
      };
    }

    return {
      mes: null,
      anio,
      rango: null,
      fechaInicio: new Date(Date.UTC(anio, 0, 1)),
      fechaFin: new Date(Date.UTC(anio, 11, 31, 23, 59, 59, 999)),
    };
  }

  // Resuelve el ID interno del usuario a partir de un ID numérico o telegramId
  private async getOrCreateUsuarioId(
    usuarioIdentifier: number | string,
    dtoTelegramId?: string,
  ): Promise<number> {
    const tgId =
      dtoTelegramId ||
      (typeof usuarioIdentifier === 'string' ? usuarioIdentifier : null);

    if (tgId) {
      let usuario = await this.prisma.usuario.findFirst({
        where: { telegramId: String(tgId) },
      });

      if (!usuario) {
        usuario = await this.prisma.usuario.create({
          data: {
            telegramId: String(tgId),
            nombre: `Usuario Telegram ${tgId}`,
          },
        });
      }
      return usuario.id;
    }

    return Number(usuarioIdentifier);
  }

  /**
   * Resuelve una categoría por ID o por nombre (case-insensitive).
   * Centraliza la lógica que antes se repetía en create y update.
   */
  private async resolverCategoriaId(
    catInput?: string | number,
  ): Promise<number> {
    if (catInput !== undefined && catInput !== null && catInput !== '') {
      const esNumerico =
        typeof catInput === 'number' ||
        (!isNaN(Number(catInput)) && Number.isInteger(Number(catInput)));

      if (esNumerico) {
        const porId = await this.prisma.categoria.findUnique({
          where: { id: Number(catInput) },
        });
        if (porId) return porId.id;
      }

      const porNombre = await this.prisma.categoria.findFirst({
        where: {
          nombre: {
            equals: String(catInput),
            mode: 'insensitive',
          },
        },
      });
      if (porNombre) return porNombre.id;
    }

    throw noEncontrado(
      `La categoría '${catInput}' no existe en la base de datos.`,
    );
  }

  private resolverMonto(dto: GastoInput): number {
    return Number(dto.valor ?? dto.monto ?? dto.total);
  }

  private resolverDescripcion(dto: GastoInput): string {
    const descripcion = dto.descripcion ?? dto.description;
    const comercio = dto.comercio ?? dto.merchant;
    return descripcion || comercio || '';
  }

  private resolverFecha(fecha?: string): Date {
    return fecha ? this.parseFechaArg(fecha) : new Date();
  }

  async create(usuarioIdentifier: number | string, dto: GastoInput) {
    const usuarioId = await this.getOrCreateUsuarioId(
      usuarioIdentifier,
      dto.telegramId,
    );
    const categoriaId = await this.resolverCategoriaId(
      dto.categoria ?? dto.category,
    );

    return this.prisma.gasto.create({
      data: {
        descripcion: this.resolverDescripcion(dto),
        monto: this.resolverMonto(dto),
        fecha: this.resolverFecha(dto.fecha),
        categoria: { connect: { id: categoriaId } },
        usuario: { connect: { id: usuarioId } },
      },
    });
  }

  private construirWhere(
    usuarioId: number,
    filtro?: FilterGastosDto,
  ): GastoWhere {
    const { fechaInicio, fechaFin, categoriaId } = filtro || {};
    const where: GastoWhere = { usuarioId };

    if (fechaInicio || fechaFin) {
      where.fecha = {
        ...(fechaInicio && { gte: this.parseFechaArg(fechaInicio) }),
        ...(fechaFin && { lte: this.parseFechaArg(fechaFin, true) }),
      };
    }

    if (categoriaId) {
      where.categoriaId = Number(categoriaId);
    }

    return where;
  }

  /** Agrega la fecha legible que consumen los listados. */
  private formatearFecha(fecha: Date): string {
    const [anio, mes, dia] = fecha.toISOString().slice(0, 10).split('-');
    return `${dia}-${mes}-${anio}`;
  }

  private conFechaFormateada<T extends { fecha: Date }>(gasto: T) {
    return { ...gasto, fechaFormateada: this.formatearFecha(gasto.fecha) };
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
      data: data.map((gasto) => this.conFechaFormateada(gasto)),
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  async findOne(usuarioId: number, id: number) {
    const gasto = await this.buscarGasto(usuarioId, id);
    return this.conFechaFormateada(gasto);
  }

  private async buscarGasto(usuarioId: number, id: number) {
    const gasto = await this.prisma.gasto.findFirst({
      where: { id, usuarioId },
      include: { categoria: true },
    });

    if (!gasto) {
      throw noEncontrado(`Gasto con ID #${id} no encontrado`);
    }

    return gasto;
  }

  async update(usuarioId: number, id: number, updateGastoDto: UpdateGastoDto) {
    await this.buscarGasto(usuarioId, id);

    const categoriaId =
      updateGastoDto.categoria !== undefined
        ? await this.resolverCategoriaId(updateGastoDto.categoria)
        : undefined;

    return await this.prisma.gasto.update({
      where: { id },
      data: {
        ...(updateGastoDto.descripcion !== undefined && {
          descripcion: updateGastoDto.descripcion,
        }),
        ...(updateGastoDto.valor !== undefined && {
          monto: updateGastoDto.valor,
        }),
        ...(categoriaId !== undefined && {
          categoria: { connect: { id: categoriaId } },
        }),
        ...(updateGastoDto.fecha !== undefined && {
          fecha: this.parseFechaArg(updateGastoDto.fecha),
        }),
      },
    });
  }

  async remove(usuarioId: number, id: number) {
    await this.buscarGasto(usuarioId, id);

    return await this.prisma.gasto.delete({
      where: { id },
    });
  }

  private async obtenerNombresCategorias(ids: number[]) {
    const categorias = await this.prisma.categoria.findMany({
      where: { id: { in: ids } },
    });
    return new Map(categorias.map((categoria) => [categoria.id, categoria.nombre]));
  }

  private sumarTotales(grupos: GrupoCategoria[]): number {
    return grupos.reduce(
      (acumulado, grupo) => acumulado + Number(grupo._sum?.monto || 0),
      0,
    );
  }

  private calcularPorcentaje(total: number, totalGeneral: number): number {
    if (totalGeneral <= 0) return 0;
    return Number(((total / totalGeneral) * 100).toFixed(2));
  }

  private formatearGrupo(
    grupo: GrupoCategoria,
    nombres: Map<number, string>,
    totalGeneral: number,
  ) {
    const total = Number(grupo._sum?.monto || 0);

    return {
      categoriaId: grupo.categoriaId,
      categoriaNombre: nombres.get(grupo.categoriaId) || 'Sin categoría',
      total,
      porcentaje: this.calcularPorcentaje(total, totalGeneral),
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
    const totalGeneral = this.sumarTotales(agrupado);

    return {
      totalGeneral,
      porCategoria: agrupado.map((item) =>
        this.formatearGrupo(item, nombres, totalGeneral),
      ),
    };
  }

  async getResumen(
    usuarioIdentifier: number | string,
    filtro: OpcionesResumen = {},
  ) {
    const usuarioId = await this.getOrCreateUsuarioId(usuarioIdentifier);
    const periodo = this.resolverPeriodo(filtro);
    const agrupado = await this.agruparPorCategoria({
      usuarioId,
      fecha: { gte: periodo.fechaInicio, lte: periodo.fechaFin },
    });

    return { periodo, ...agrupado };
  }
}
