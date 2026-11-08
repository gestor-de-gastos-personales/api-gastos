import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePresupuestoDto } from './dto/create-presupuesto.dto.js';

/** Presupuestos mensuales por categoría (F5). */
@Injectable()
export class PresupuestosService {
  constructor(private readonly prisma: PrismaService) {}

  private async usuarioIdPorTelegram(
    telegramId: string,
    crear: true,
  ): Promise<number>;
  private async usuarioIdPorTelegram(
    telegramId: string,
    crear?: false,
  ): Promise<number | null>;
  private async usuarioIdPorTelegram(
    telegramId: string,
    crear = false,
  ): Promise<number | null> {
    const existente = await this.prisma.usuario.findFirst({
      where: { telegramId: String(telegramId) },
    });

    if (existente) {
      return existente.id;
    }

    if (!crear) {
      return null;
    }

    const creado = await this.prisma.usuario.create({
      data: {
        telegramId: String(telegramId),
        nombre: `Usuario Telegram ${telegramId}`,
      },
    });

    return creado.id;
  }

  async listar(telegramId: string, mes?: number, anio?: number) {
    const usuarioId = await this.usuarioIdPorTelegram(telegramId);

    if (usuarioId === null) {
      return { data: [], total: 0 };
    }

    const data = await this.prisma.presupuesto.findMany({
      where: {
        usuarioId,
        ...(mes !== undefined && { mes }),
        ...(anio !== undefined && { anio }),
      },
      include: { categoria: true },
      orderBy: [{ anio: 'desc' }, { mes: 'desc' }],
    });

    return { data, total: data.length };
  }

  async guardar(dto: CreatePresupuestoDto) {
    const usuarioId = await this.usuarioIdPorTelegram(dto.telegramId, true);

    return this.prisma.presupuesto.upsert({
      where: {
        usuarioId_categoriaId_mes_anio: {
          usuarioId,
          categoriaId: dto.categoriaId,
          mes: dto.mes,
          anio: dto.anio,
        },
      },
      update: { monto: dto.monto },
      create: {
        usuarioId,
        categoriaId: dto.categoriaId,
        monto: dto.monto,
        mes: dto.mes,
        anio: dto.anio,
      },
      include: { categoria: true },
    });
  }
}
