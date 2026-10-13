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

  async create(usuarioId: number, createGastoDto: CreateGastoDto) {
    const categoriaExiste = await this.prisma.categoria.findUnique({
      where: { id: createGastoDto.categoria },
    });

    if (!categoriaExiste) {
      throw new NotFoundException(
        `La categoría con ID #${createGastoDto.categoria} no existe`,
      );
    }

    const fecha = createGastoDto.fecha
      ? this.parseFechaArg(createGastoDto.fecha)
      : new Date();

    return this.prisma.gasto.create({
      data: {
        descripcion: createGastoDto.descripcion,
        monto: createGastoDto.valor,
        fecha,
        categoriaId: createGastoDto.categoria,
        usuarioId,
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

    if (updateGastoDto.categoria !== undefined) {
      const categoriaExiste = await this.prisma.categoria.findUnique({
        where: { id: updateGastoDto.categoria },
      });

      if (!categoriaExiste) {
        throw new NotFoundException(
          `La categoría con ID #${updateGastoDto.categoria} no existe`,
        );
      }
    }

    return await this.prisma.gasto.update({
      where: { id },
      data: {
        descripcion: updateGastoDto.descripcion,
        monto: updateGastoDto.valor,
        categoriaId: updateGastoDto.categoria,
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

  async getResumen(usuarioId: number, filterDto?: FilterResumenDto) {
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