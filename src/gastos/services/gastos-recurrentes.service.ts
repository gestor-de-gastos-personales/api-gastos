import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { UsuariosGastosService } from './usuarios-gastos.service.js';
import { CreateGastoRecurrenteDto } from '../dto/create-gasto-recurrente.dto.js';
import { UpdateGastoRecurrenteDto } from '../dto/update-gasto-recurrente.dto.js';

const noEncontrado = (mensaje: string) => new NotFoundException(mensaje);

/** Notificación pendiente que consume el bot. */
export interface NotificacionRecurrente {
  reglaId: number;
  telegramId: string | null;
  descripcion: string;
  monto: number;
  fecha: Date | null;
}

const DIA_MS = 24 * 60 * 60 * 1000;

/**
 * Gestión de gastos recurrentes: alta, listado, edición, baja, ejecución
 * de las reglas vencidas y generación idempotente de notificaciones.
 */
@Injectable()
export class GastosRecurrentesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usuarios: UsuariosGastosService,
  ) {}

  /** Calcula la próxima fecha de ejecución según la frecuencia. */
  calcularProximaEjecucion(
    frecuencia: string,
    diaMes?: number,
    diaSemana?: number,
  ): Date {
    const ahora = new Date();

    if (frecuencia === 'DIARIA') {
      return new Date(ahora.getTime() + DIA_MS);
    }

    if (frecuencia === 'SEMANAL') {
      const dias =
        ((diaSemana ?? ahora.getDay()) - ahora.getDay() + 7) % 7 || 7;
      return new Date(ahora.getTime() + dias * DIA_MS);
    }

    if (frecuencia === 'MENSUAL') {
      const dia = diaMes ?? ahora.getDate();
      return new Date(
        Date.UTC(ahora.getUTCFullYear(), ahora.getUTCMonth() + 1, dia),
      );
    }

    return new Date(
      Date.UTC(
        ahora.getUTCFullYear() + 1,
        ahora.getUTCMonth(),
        ahora.getUTCDate(),
      ),
    );
  }

  async createRecurrente(dto: CreateGastoRecurrenteDto) {
    const usuarioId = await this.usuarios.obtenerOCrearUsuarioId(
      dto.usuarioId,
      dto.telegramId,
    );
    const categoriaId = dto.categoriaId
      ? dto.categoriaId
      : await this.usuarios.resolverCategoriaId(dto.categoria);

    return this.prisma.gastoRecurrente.create({
      data: {
        usuarioId,
        monto: dto.monto,
        comercio: dto.comercio ?? null,
        categoriaId,
        descripcion: dto.descripcion,
        frecuencia: dto.frecuencia,
        diaSemana: dto.diaSemana ?? null,
        diaMes: dto.diaMes ?? null,
        activo: dto.activo ?? true,
        proximaEjecucion: this.calcularProximaEjecucion(
          dto.frecuencia,
          dto.diaMes,
          dto.diaSemana,
        ),
      },
      include: { categoria: true },
    });
  }

  async listRecurrentes(
    usuarioIdentifier: number | string,
    telegramId?: string,
  ) {
    const usuarioId = await this.usuarios.obtenerOCrearUsuarioId(
      usuarioIdentifier,
      telegramId,
    );

    return this.prisma.gastoRecurrente.findMany({
      where: { usuarioId },
      include: { categoria: true },
      orderBy: { id: 'desc' },
    });
  }

  async getRecurrentesVencidas() {
    return this.prisma.gastoRecurrente.findMany({
      where: { activo: true, proximaEjecucion: { lte: new Date() } },
      include: { categoria: true, usuario: true },
    });
  }

  /** Busca una regla del usuario o lanza 404. */
  private async buscarRegla(usuarioId: number, id: number) {
    const regla = await this.prisma.gastoRecurrente.findFirst({
      where: { id, usuarioId },
    });

    if (!regla) throw noEncontrado('Regla recurrente no encontrada');
    return regla;
  }

  private async resolverCategoriaDeRegla(
    dto: UpdateGastoRecurrenteDto,
    categoriaActual: number,
  ): Promise<number> {
    if (dto.categoriaId) return dto.categoriaId;
    if (dto.categoria) return this.usuarios.resolverCategoriaId(dto.categoria);
    return categoriaActual;
  }

  async updateRecurrente(
    usuarioIdentifier: number | string,
    id: number,
    dto: UpdateGastoRecurrenteDto,
    telegramId?: string,
  ) {
    const usuarioId = await this.usuarios.obtenerOCrearUsuarioId(
      usuarioIdentifier,
      telegramId,
    );
    const regla = await this.buscarRegla(usuarioId, id);
    const categoriaId = await this.resolverCategoriaDeRegla(
      dto,
      regla.categoriaId,
    );
    const proximaEjecucion = this.calcularSiCambiaFrecuencia(dto, regla);

    return this.prisma.gastoRecurrente.update({
      where: { id },
      data: {
        monto: dto.monto ?? regla.monto,
        comercio: dto.comercio ?? regla.comercio,
        categoriaId,
        descripcion: dto.descripcion ?? regla.descripcion,
        frecuencia: dto.frecuencia ?? regla.frecuencia,
        diaSemana: dto.diaSemana ?? regla.diaSemana,
        diaMes: dto.diaMes ?? regla.diaMes,
        activo: dto.activo ?? regla.activo,
        proximaEjecucion,
      },
      include: { categoria: true },
    });
  }

  private calcularSiCambiaFrecuencia(
    dto: UpdateGastoRecurrenteDto,
    regla: { frecuencia: string; diaMes: number | null; diaSemana: number | null; proximaEjecucion: Date },
  ): Date {
    const cambiaCalendario =
      dto.frecuencia || dto.diaMes !== undefined || dto.diaSemana !== undefined;

    if (!cambiaCalendario) return regla.proximaEjecucion;

    return this.calcularProximaEjecucion(
      dto.frecuencia ?? regla.frecuencia,
      dto.diaMes ?? regla.diaMes ?? undefined,
      dto.diaSemana ?? regla.diaSemana ?? undefined,
    );
  }

  async removeRecurrente(
    usuarioIdentifier: number | string,
    id: number,
    telegramId?: string,
  ) {
    const usuarioId = await this.usuarios.obtenerOCrearUsuarioId(
      usuarioIdentifier,
      telegramId,
    );
    await this.buscarRegla(usuarioId, id);

    return this.prisma.gastoRecurrente.delete({ where: { id } });
  }

  /** Registra el gasto de una regla y reprograma la siguiente ejecución. */
  async ejecutarRecurrente(reglaId: number) {
    const regla = await this.prisma.gastoRecurrente.findUnique({
      where: { id: reglaId },
      include: { categoria: true, usuario: true },
    });

    if (!regla || !regla.activo) return null;

    const gasto = await this.prisma.gasto.create({
      data: {
        descripcion: regla.descripcion,
        monto: regla.monto,
        fecha: new Date(),
        categoriaId: regla.categoriaId,
        usuarioId: regla.usuarioId,
      },
      include: { categoria: true },
    });

    await this.prisma.gastoRecurrente.update({
      where: { id: regla.id },
      data: {
        ultimaEjecucion: new Date(),
        proximaEjecucion: this.calcularProximaEjecucion(
          regla.frecuencia,
          regla.diaMes ?? undefined,
          regla.diaSemana ?? undefined,
        ),
        notificado: false,
      },
    });

    return gasto;
  }

  /** Ejecuta todas las reglas vencidas; lo usa el scheduler de la API. */
  async ejecutarVencidas() {
    const vencidas = await this.getRecurrentesVencidas();
    const ejecutadas = [];

    for (const regla of vencidas) {
      const gasto = await this.ejecutarRecurrente(regla.id);
      if (gasto) ejecutadas.push(gasto);
    }

    return ejecutadas;
  }

  /**
   * Devuelve las ejecuciones pendientes de notificar y las marca como
   * notificadas, para que el bot solo envíe el aviso una única vez.
   */
  async obtenerYMarcarNotificaciones(): Promise<NotificacionRecurrente[]> {
    const pendientes = await this.prisma.gastoRecurrente.findMany({
      where: { notificado: false, ultimaEjecucion: { not: null } },
      include: { categoria: true, usuario: true },
    });

    if (pendientes.length === 0) return [];

    await this.prisma.gastoRecurrente.updateMany({
      where: { id: { in: pendientes.map((regla) => regla.id) } },
      data: { notificado: true },
    });

    return pendientes.map((regla) => ({
      reglaId: regla.id,
      telegramId: regla.usuario.telegramId,
      descripcion: regla.descripcion,
      monto: Number(regla.monto),
      fecha: regla.ultimaEjecucion,
    }));
  }
}
