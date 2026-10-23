import { Controller, Delete, Get, Param, Patch, Query } from '@nestjs/common';
import { GastosService } from '../services/gastos.service.js';

@Controller('gastos')
export class GastosUltimoController {
  constructor(private readonly gastosService: GastosService) {}

  @Get('ultimo')
  ultimo(
    @Query('usuarioId') usuarioId?: string,
    @Query('telegramId') telegramId?: string,
    @Query('comercio') comercio?: string,
    @Query('categoria') categoria?: string,
    @Query('desde') desde?: string,
  ) {
    const id = usuarioId ?? telegramId ?? '0';
    return this.gastosService.getUltimoGasto(id, {
      telegramId,
      comercio,
      categoria,
      desde,
    });
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('usuarioId') usuarioId?: string,
    @Query('telegramId') telegramId?: string,
  ) {
    const user = Number(usuarioId ?? '0');
    if (telegramId) {
      return this.gastosService.getUltimoGasto(telegramId, {}).then((gasto) => {
        if (gasto.id !== Number(id)) throw new Error('No encontrado');
        return gasto;
      });
    }
    return this.gastosService.getGastoById(user, Number(id));
  }
}
