import * as nj from '../../common/nest.js';
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
@nj.controller('gastos')
export class GastosBotController {
  constructor(private readonly gastosService: GastosService) {}

  @nj.post('bot')
  createFromBot(@nj.body() body: DTO.CreateGastoBotDto) {
    return this.gastosService.create(body.telegramId, body);
  }

  @nj.get('resumen/bot')
  getResumenBot(@nj.query() filtro: DTO.FilterResumenBotDto) {
    return this.gastosService.getResumen(filtro.telegramId, filtro);
  }

  /** Últimos gastos con paginación y filtros (F1). */
  @nj.get('ultimos')
  getUltimos(@nj.query() filtro: DTO.FilterUltimosDto) {
    const identidad = filtro.telegramId ?? filtro.usuarioId ?? '0';
    return this.gastosService.getUltimos(identidad, filtro);
  }

  @nj.get('ultimo')
  ultimo(
    @nj.query('usuarioId') usuarioId?: string,
    @nj.query('telegramId') telegramId?: string,
    @nj.query('comercio') comercio?: string,
    @nj.query('categoria') categoria?: string,
    @nj.query('desde') desde?: string,
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
