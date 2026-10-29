import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { GastosService } from '../services/gastos.service.js';
import { CreateGastoBotDto } from '../dto/create-gasto-bot.dto.js';
import { FilterResumenBotDto } from '../dto/filter-resumen-bot.dto.js';
import { FilterUltimosDto } from '../dto/filter-ultimos.dto.js';

/**
 * Endpoints libres (sin JWT) que consume el bot de Telegram.
 * Se aíslan de los endpoints web para no mezclar mecanismos de autenticación.
 *
 * Las rutas literales (`bot`, `resumen/bot`, `ultimos`, `ultimo`) se declaran
 * en este controlador, que se registra antes que el de detalle (`:id`), para
 * que Express no las capture como un id.
 */
@Controller('gastos')
export class GastosBotController {
  constructor(private readonly gastosService: GastosService) {}

  @Post('bot')
  createFromBot(@Body() body: CreateGastoBotDto) {
    return this.gastosService.create(body.telegramId, body);
  }

  @Get('resumen/bot')
  getResumenBot(@Query() filtro: FilterResumenBotDto) {
    return this.gastosService.getResumen(filtro.telegramId, filtro);
  }

  /** Últimos gastos con paginación y filtros (F1). */
  @Get('ultimos')
  getUltimos(@Query() filtro: FilterUltimosDto) {
    const identidad = filtro.telegramId ?? filtro.usuarioId ?? '0';
    return this.gastosService.getUltimos(identidad, filtro);
  }

  @Get('ultimo')
  ultimo(
    @Query('usuarioId') usuarioId?: string,
    @Query('telegramId') telegramId?: string,
    @Query('comercio') comercio?: string,
    @Query('categoria') categoria?: string,
    @Query('desde') desde?: string,
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
