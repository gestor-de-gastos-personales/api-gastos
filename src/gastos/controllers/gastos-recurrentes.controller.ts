import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { GastosService } from '../services/gastos.service.js';
import { CreateGastoRecurrenteDto } from '../dto/create-gasto-recurrente.dto.js';
import { UpdateGastoRecurrenteDto } from '../dto/update-gasto-recurrente.dto.js';

@Controller('gastos/recurrentes')
export class GastosRecurrentesController {
  constructor(private readonly gastosService: GastosService) {}

  @Post()
  create(@Body() dto: CreateGastoRecurrenteDto) {
    return this.gastosService.createRecurrente(dto);
  }

  @Get()
  findAll(@Query('usuarioId') usuarioId?: string, @Query('telegramId') telegramId?: string) {
    const id = usuarioId ?? telegramId ?? '0';
    return this.gastosService.listRecurrentes(id, telegramId);
  }

  @Get('vencidas')
  vencidas() {
    return this.gastosService.getRecurrentesVencidas();
  }

  @Post('ejecutar')
  ejecutar(@Body() body: { reglaId?: number }) {
    if (body.reglaId) {
      return this.gastosService.ejecutarRecurrente(body.reglaId);
    }
    return this.gastosService.getRecurrentesVencidas().then((reglas) =>
      Promise.all(reglas.map((regla) => this.gastosService.ejecutarRecurrente(regla.id))),
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateGastoRecurrenteDto,
    @Query('usuarioId') usuarioId?: string,
    @Query('telegramId') telegramId?: string,
  ) {
    const user = usuarioId ?? telegramId ?? '0';
    return this.gastosService.updateRecurrente(user, Number(id), dto, telegramId);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Query('usuarioId') usuarioId?: string,
    @Query('telegramId') telegramId?: string,
  ) {
    const user = usuarioId ?? telegramId ?? '0';
    return this.gastosService.removeRecurrente(user, Number(id), telegramId);
  }
}
