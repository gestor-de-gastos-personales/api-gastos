import * as nest from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { RecurrenciaCalendarioService } from './recurrencia-calendario.service.js';

/** Notificación pendiente que consume el bot. */
export interface NotificacionRecurrente {
  reglaId: number;
  telegramId: string | null;
  descripcion: string;
  monto: number;
  fecha: Date | null;
}

/**
 * Ejecución de reglas vencidas y generación idempotente de notificaciones.
 */
@nest.Injectable()
export class GastosRecurrentesEjecucionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly calendario: RecurrenciaCalendarioService,
  ) {}

  async getRecurrentesVencidas() {
    return this.prisma.gastoRecurrente.findMany({
      where: { activo: true, proximaEjecucion: { lte: new Date() } },
      include: { categoria: true, usuario: true },
    });
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
        proximaEjecucion: this.calendario.calcularProximaEjecucion(
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
