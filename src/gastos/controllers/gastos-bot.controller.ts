import * as nest from '@nestjs/common';
import { GastosService } from '../services/gastos.service.js';
import * as DTO from '../dto/index.js';

/**
 * Endpoints libres (sin JWT) que consume el bot de Telegram.
 * Se aíslan de los endpoints web para no mezclar mecanismos de autenticación.
 *
 * Las rutas literales (`bot`, `resumen/bot`, `ultimos`, `ultimo`) se declaran
 * en este controlador, que se registra antes que el de detalle (`:id`), para
 * que Express no las capture como un id.
 */
@nest.Controller('gastos')
export class GastosBotController {
  constructor(private readonly gastosService: GastosService) {}

  @nest.Post('bot')
  createFromBot(@nest.Body() body: DTO.CreateGastoBotDto) {
    return this.gastosService.create(body.telegramId, body);
  }

  @nest.Get('resumen/bot')
  getResumenBot(@nest.Query() filtro: DTO.FilterResumenBotDto) {
    return this.gastosService.getResumen(filtro.telegramId, filtro);
  }

  /** Últimos gastos con paginación y filtros (F1). */
  @nest.Get('ultimos')
  getUltimos(@nest.Query() filtro: DTO.FilterUltimosDto) {
    const identidad = filtro.telegramId ?? filtro.usuarioId ?? '0';
    return this.gastosService.getUltimos(identidad, filtro);
  }

  @nest.Get('ultimo')
  ultimo(
    @nest.Query('usuarioId') usuarioId?: string,
    @nest.Query('telegramId') telegramId?: string,
    @nest.Query('comercio') comercio?: string,
    @nest.Query('categoria') categoria?: string,
    @nest.Query('desde') desde?: string,
  ) {
    const identidad = usuarioId ?? telegramId ?? '0';
    return this.gastosService.getUltimoGasto(identidad, {
      telegramId,
      comercio,
      categoria,
      desde,
    });
  }
}
