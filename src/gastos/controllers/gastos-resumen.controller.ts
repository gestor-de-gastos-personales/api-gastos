import { Controller, Get, Query } from '@nestjs/common';
import { GastosService } from '../services/gastos.service.js';
import { FilterResumenDto } from '../dto/filter-resumen.dto.js';
import { Autenticado } from '../../auth/decorators/autenticado.decorator.js';
import { GetUser } from '../../auth/decorators/get-user.decorator.js';

@Controller('gastos/resumen')
@Autenticado()
export class GastosResumenController {
  constructor(private readonly gastosService: GastosService) {}

  @Get()
  getResumen(
    @GetUser('id') usuarioId: number,
    @Query() filterDto: FilterResumenDto,
  ) {
    return this.gastosService.getResumen(usuarioId, filterDto);
  }
}
