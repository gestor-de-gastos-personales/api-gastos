import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { GastosService } from '../services/gastos.service.js';
import { CreateGastoBotDto } from '../dto/create-gasto-bot.dto.js';

/**
 * Endpoints libres (sin JWT) que consume el bot de Telegram.
 * Se aíslan de los endpoints web para no mezclar mecanismos de autenticación.
 */
@Controller('gastos')
export class GastosBotController {
  constructor(private readonly gastosService: GastosService) {}

  @Post('bot')
  createFromBot(@Body() body: CreateGastoBotDto) {
    return this.gastosService.create(body.telegramId, body);
  }

  @Get('resumen/bot')
  getResumenBot(@Query('telegramId') telegramId: string) {
    return this.gastosService.getResumen(telegramId, {});
  }
}
