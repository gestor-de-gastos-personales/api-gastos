import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGastoDto } from './dto/create-gasto.dto.js';
import { UpdateGastoDto } from './dto/update-gasto.dto.js';
import { FilterGastosDto } from './dto/filter-gasto.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { FilterResumenDto } from './dto/filter-resumen.dto.js';
import { Prisma } from '@prisma/client';

@Injectable()
export class GastosService {
  constructor(private readonly prisma: PrismaService) {}

  // Convierte 'DD-MM-YYYY' a Date de JS en formato UTC/ISO
  private parseFechaArg(fechaStr: string, esFinDeDia = false): Date {
    const [dia, mes, anio] = fechaStr.split('-');
    const hora = esFinDeDia ? '23:59:59.999Z' : '00:00:00.000Z';
    return new Date(`${anio}-${mes}-${dia}T${hora}`);
  }

  // Resuelve el ID interno del usuario a partir de un ID numérico o telegramId
  private async getOrCreateUsuarioId(usuarioIdentifier: any, dtoTelegramId?: string): Promise<number> {
    const tgId = dtoTelegramId || (typeof usuarioIdentifier === 'string' ? usuarioIdentifier : null);

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

  async create(usuarioIdentifier: any, createGastoDto: any) {
    // 1. Obtener/Crear el usuario correspondiente
    const usuarioId = await this.getOrCreateUsuarioId(
      usuarioIdentifier,
      createGastoDto.telegramId,
    );

    // 2. Buscar categoría por ID (si es número) o por Nombre (si es string)
    const catInput = createGastoDto.categoria ?? createGastoDto.category;
    let categoriaExiste = null;

    if (typeof catInput === 'number' || (!isNaN(Number(catInput)) && Number.isInteger(Number(catInput)))) {
      categoriaExiste = await this.prisma.categoria.findUnique({
        where: { id: Number(catInput) },
      });
    }

    if (!categoriaExiste && catInput) {
      categoriaExiste = await this.prisma.categoria.findFirst({
        where: {
          nombre: {
            equals: String(catInput),
            mode: 'insensitive',
          },
        },
      });
    }

    if (!categoriaExiste) {
      throw new NotFoundException(
        `La categoría '${catInput}' no existe en la base de datos.`,
      );
    }

    // 3. Procesar fecha, monto y descripción
    const fecha = createGastoDto.fecha
      ? this.parseFechaArg(createGastoDto.fecha)
      : new Date();

    const monto = Number(
      createGastoDto.valor ?? createGastoDto.monto ?? createGastoDto.total,
    );

    const comercioStr = createGastoDto.comercio ?? createGastoDto.merchant;
    const descStr = createGastoDto.descripcion ?? createGastoDto.description;
    const descripcion = descStr || comercioStr || '';

    // 4. Crear el registro usando las conexiones relacionales explícitas
    return this.prisma.gasto.create({
      data: {
        descripcion,
        monto,
        fecha,
        categoria: {
          connect: { id: categoriaExiste.id },
        },
        usuario: {
          connect: { id: usuarioId },
        },
      },
    });
  }

  async findAll(usuarioId: number, filterDto?: FilterGastosDto) {
    const { page = 1, limit = 10, fechaInicio, fechaFin, categoriaId } =
      filterDto || {};

    const where: Prisma.GastoWhereInput = {
      usuarioId,
    };

    if (fechaInicio || fechaFin) {
      where.fecha = {
        ...(fechaInicio && { gte: this.parseFechaArg(fechaInicio) }),
        ...(fechaFin && { lte: this.parseFechaArg(fechaFin, true) }),
      };
    }

    if (categoriaId) {
      where.categoriaId = Number(categoriaId);
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.gasto.findMany({
        where,
        include: { categoria: true },
        orderBy: { fecha: 'desc' },
        skip,
        take: limitNum,
      }),
      this.prisma.gasto.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  async findOne(usuarioId: number, id: number) {
    const gasto = await this.prisma.gasto.findFirst({
      where: {
        id,
        usuarioId,
      },
      include: {
        categoria: true,
      },
    });

    if (!gasto) {
      throw new NotFoundException(`Gasto con ID #${id} no encontrado`);
    }

    return gasto;
  }

  async update(usuarioId: number, id: number, updateGastoDto: UpdateGastoDto) {
    await this.findOne(usuarioId, id);

    let categoriaId: number | undefined;

    if (updateGastoDto.categoria !== undefined) {
      const catInput = updateGastoDto.categoria;
      let categoriaExiste = null;

      if (typeof catInput === 'number' || (!isNaN(Number(catInput)) && Number.isInteger(Number(catInput)))) {
        categoriaExiste = await this.prisma.categoria.findUnique({
          where: { id: Number(catInput) },
        });
      }

      if (!categoriaExiste && catInput) {
        categoriaExiste = await this.prisma.categoria.findFirst({
          where: {
            nombre: {
              equals: String(catInput),
              mode: 'insensitive',
            },
          },
        });
      }

      if (!categoriaExiste) {
        throw new NotFoundException(
          `La categoría '${catInput}' no existe`,
        );
      }
      categoriaId = categoriaExiste.id;
    }

    return await this.prisma.gasto.update({
      where: { id },
      data: {
        descripcion: updateGastoDto.descripcion ?? '',
        monto: updateGastoDto.valor,
        ...(categoriaId && { categoria: { connect: { id: categoriaId } } }),
        ...(updateGastoDto.fecha && {
          fecha: this.parseFechaArg(updateGastoDto.fecha),
        }),
      },
    });
  }

  async remove(usuarioId: number, id: number) {
    await this.findOne(usuarioId, id);

    return await this.prisma.gasto.delete({
      where: { id },
    });
  }

  async getResumen(usuarioIdentifier: any, filterDto?: FilterResumenDto) {
    const usuarioId = await this.getOrCreateUsuarioId(usuarioIdentifier);

    const ahora = new Date();
    const anio = filterDto?.anio ? Number(filterDto.anio) : ahora.getFullYear();
    const mes = filterDto?.mes ? Number(filterDto.mes) : undefined;

    let fechaInicio: Date;
    let fechaFin: Date;

    if (mes) {
      fechaInicio = new Date(Date.UTC(anio, mes - 1, 1, 0, 0, 0, 0));
      fechaFin = new Date(Date.UTC(anio, mes, 0, 23, 59, 59, 999));
    } else {
      fechaInicio = new Date(Date.UTC(anio, 0, 1, 0, 0, 0, 0));
      fechaFin = new Date(Date.UTC(anio, 11, 31, 23, 59, 59, 999));
    }

    const where: Prisma.GastoWhereInput = {
      usuarioId,
      fecha: {
        gte: fechaInicio,
        lte: fechaFin,
      },
    };

    const agrupado = await this.prisma.gasto.groupBy({
      by: ['categoriaId'],
      _sum: {
        monto: true,
      },
      where,
    });

    const idsCategorias = agrupado.map((item) => item.categoriaId);
    const categorias = await this.prisma.categoria.findMany({
      where: { id: { in: idsCategorias } },
    });

    const mapaCategorias = new Map(categorias.map((c) => [c.id, c.nombre]));

    const totalGeneral = agrupado.reduce(
      (acum, item) => acum + Number(item._sum?.monto || 0),
      0,
    );

    const porCategoria = agrupado.map((item) => {
      const total = Number(item._sum?.monto || 0);
      const porcentaje =
        totalGeneral > 0
          ? Number(((total / totalGeneral) * 100).toFixed(2))
          : 0;

      return {
        categoriaId: item.categoriaId,
        categoriaNombre:
          mapaCategorias.get(item.categoriaId) || 'Sin categoría',
        total,
        porcentaje,
      };
    });

    return {
      periodo: {
        mes: mes ?? null,
        anio,
        fechaInicio,
        fechaFin,
      },
      totalGeneral,
      porCategoria,
    };
  }
}