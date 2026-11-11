import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { PresupuestosService } from './presupuestos.service.js';
import { CreatePresupuestoDto } from './dto/create-presupuesto.dto.js';

@Controller('presupuestos')
export class PresupuestosController {
  constructor(private readonly presupuestosService: PresupuestosService) {}

  @Get()
  listar(
    @Query('telegramId') telegramId?: string,
    @Query('mes') mes?: string,
    @Query('anio') anio?: string,
  ) {
    return this.presupuestosService.listar(
      telegramId ?? '',
      mes !== undefined ? Number(mes) : undefined,
      anio !== undefined ? Number(anio) : undefined,
    );
  }

  @Post()
  guardar(@Body() dto: CreatePresupuestoDto) {
    return this.presupuestosService.guardar(dto);
  }
}
