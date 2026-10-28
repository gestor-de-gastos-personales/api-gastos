import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { GastosService } from '../services/gastos.service.js';

/**
 * Scheduler de gastos recurrentes.
 *
 * Corre dentro de api-gastos para que cualquier servicio (bot, web, mobile)
 * se beneficie del registro automático sin depender de un proceso externo.
 * La expresión cron es configurable con RECURRENTES_CRON (default: cada hora).
 */
@Injectable()
export class GastosRecurrentesScheduler {
  private readonly logger = new Logger(GastosRecurrentesScheduler.name);

  constructor(private readonly gastosService: GastosService) {}

  @Cron(process.env.RECURRENTES_CRON || '0 * * * *')
  async ejecutarVencidas() {
    try {
      const ejecutadas = await this.gastosService.ejecutarVencidas();

      if (ejecutadas.length > 0) {
        this.logger.log(
          `Gastos recurrentes ejecutados: ${ejecutadas.length} (${ejecutadas
            .map((gasto) => `#${gasto.id}`)
            .join(', ')})`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error al ejecutar gastos recurrentes: ${String(
          error instanceof Error ? error.message : error,
        )}`,
      );
    }
  }
}
