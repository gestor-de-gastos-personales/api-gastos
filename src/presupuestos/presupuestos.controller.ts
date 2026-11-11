import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { PresupuestosService } from './presupuestos.service.js';
import { CreatePresupuestoDto } from './dto/create-presupuesto.dto.js';
import { PresupuestoMioDto } from './dto/presupuesto-mio.dto.js';
import { Autenticado } from '../auth/decorators/autenticado.decorator.js';
import { GetUser } from '../auth/decorators/get-user.decorator.js';

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

  /** Presupuestos del usuario autenticado (web). */
  @Get('mios')
  @Autenticado()
  listarMios(
    @GetUser('id') usuarioId: number,
    @Query('mes') mes?: string,
    @Query('anio') anio?: string,
  ) {
    return this.presupuestosService.listarPorUsuario(
      usuarioId,
      mes !== undefined ? Number(mes) : undefined,
      anio !== undefined ? Number(anio) : undefined,
    );
  }

  @Post('mios')
  @Autenticado()
  guardarMio(
    @GetUser('id') usuarioId: number,
    @Body() dto: PresupuestoMioDto,
  ) {
    return this.presupuestosService.guardarParaUsuario(usuarioId, dto);
  }
}
