import { Controller, Get, Post, Patch, Delete, Body, Query, Param } from '@nestjs/common';
import { GastosService } from '../services/gastos.service.js';
import { CreateGastoBotDto } from '../dto/create-gasto-bot.dto.js';
import { FilterResumenBotDto } from '../dto/filter-resumen-bot.dto.js';

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
  getResumenBot(@Query() filtro: FilterResumenBotDto) {
    return this.gastosService.getResumen(filtro.telegramId, filtro);
  }

  @Get(':id')
  findOneFromBot(
    @Param('id') id: string,
    @Query('telegramId') telegramId?: string,
    @Query('usuarioId') usuarioId?: string,
  ) {
    const user = telegramId ?? usuarioId ?? '0';
    return this.gastosService.getGastoById(user, Number(id));
  }

  @Patch(':id')
  updateFromBot(
    @Param('id') id: string,
    @Query('telegramId') telegramId?: string,
    @Query('usuarioId') usuarioId?: string,
    @Body() body?: Record<string, unknown>,
  ) {
    const user = telegramId ?? usuarioId ?? '0';
    const datos = { ...(body || {}), ...(telegramId ? { telegramId } : {}) };
    return this.gastosService.update(user as any, Number(id), datos);
  }

  @Delete(':id')
  removeFromBot(
    @Param('id') id: string,
    @Query('telegramId') telegramId?: string,
    @Query('usuarioId') usuarioId?: string,
  ) {
    const user = telegramId ?? usuarioId ?? '0';
    return this.gastosService.remove(user as any, Number(id));
  }
}
