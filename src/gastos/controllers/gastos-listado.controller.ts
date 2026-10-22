import { Controller, Get, Query, Param } from '@nestjs/common';
import { GastosService } from '../services/gastos.service.js';
import { FilterGastosDto } from '../dto/filter-gasto.dto.js';
import { Autenticado } from '../../auth/decorators/autenticado.decorator.js';
import { GetUser } from '../../auth/decorators/get-user.decorator.js';

@Controller('gastos')
@Autenticado()
export class GastosListadoController {
  constructor(private readonly gastosService: GastosService) {}

  @Get()
  findAll(
    @GetUser('id') usuarioId: number,
    @Query() filterDto: FilterGastosDto,
  ) {
    return this.gastosService.findAll(usuarioId, filterDto);
  }

  @Get(':id')
  findOne(@GetUser('id') usuarioId: number, @Param('id') id: string) {
    return this.gastosService.findOne(usuarioId, Number(id));
  }
}
