import { randomBytes } from 'node:crypto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateGrupoDto } from './dto/create-grupo.dto.js';
import { UnirseGrupoDto } from './dto/unirse-grupo.dto.js';

/** Grupos compartidos de gastos (F8/F10). */
@Injectable()
export class GruposService {
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

  private generarCodigoInvitacion(): string {
    return randomBytes(6).toString('base64url');
  }

  async listar(telegramId: string) {
    const usuarioId = await this.usuarioIdPorTelegram(telegramId);

    if (usuarioId === null) {
      return { data: [], total: 0 };
    }

    const data = await this.prisma.grupo.findMany({
      where: {
        OR: [{ usuarioId }, { miembros: { some: { usuarioId } } }],
      },
      include: {
        miembros: true,
        _count: { select: { miembros: true, gastos: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { data, total: data.length };
  }

  async crear(dto: CreateGrupoDto) {
    const usuarioId = await this.usuarioIdPorTelegram(dto.telegramId, true);

    return this.prisma.grupo.create({
      data: {
        nombre: dto.nombre,
        codigoInvitacion: this.generarCodigoInvitacion(),
        usuarioId,
        miembros: {
          create: { usuarioId, rol: 'owner' },
        },
      },
      include: { miembros: true },
    });
  }

  async unirse(dto: UnirseGrupoDto) {
    const grupo = await this.prisma.grupo.findUnique({
      where: { codigoInvitacion: dto.codigoInvitacion },
    });

    if (!grupo) {
      throw new NotFoundException(
        `No existe un grupo con el código ${dto.codigoInvitacion}`,
      );
    }

    const usuarioId = await this.usuarioIdPorTelegram(dto.telegramId, true);

    await this.prisma.grupoMiembro.upsert({
      where: {
        grupoId_usuarioId: { grupoId: grupo.id, usuarioId },
      },
      update: {},
      create: { grupoId: grupo.id, usuarioId, rol: 'miembro' },
    });

    return this.prisma.grupo.findUnique({
      where: { id: grupo.id },
      include: { miembros: true },
    });
  }
}
