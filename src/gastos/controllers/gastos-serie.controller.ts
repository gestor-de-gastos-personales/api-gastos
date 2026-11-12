import { Controller, Get, Query } from '@nestjs/common';
import { GastosSerieService } from '../services/gastos-serie.service.js';
import { SerieQueryDto } from '../dto/serie-query.dto.js';
import { Autenticado } from '../../auth/decorators/autenticado.decorator.js';
import { GetUser } from '../../auth/decorators/get-user.decorator.js';

/**
 * Serie temporal del usuario autenticado para los gráficos del dashboard.
 * Se registra antes del controlador de detalle para que `serie` no se
 * interprete como un `:id`.
 */
@Controller('gastos')
@Autenticado()
export class GastosSerieController {
  constructor(private readonly gastosSerie: GastosSerieService) {}

  @Get('serie')
  getSerie(
    @GetUser('id') usuarioId: number,
    @Query() filtro: SerieQueryDto,
  ) {
    return this.gastosSerie.getSerie(usuarioId, filtro);
  }
}
