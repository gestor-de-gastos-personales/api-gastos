import { Controller, Post, Body } from '@nestjs/common';
import { GastosService } from '../services/gastos.service.js';
import { CreateGastoDto } from '../dto/create-gasto.dto.js';
import { Autenticado } from '../../auth/decorators/autenticado.decorator.js';
import { GetUser } from '../../auth/decorators/get-user.decorator.js';

@Controller('gastos')
@Autenticado()
export class GastosAltaController {
  constructor(private readonly gastosService: GastosService) {}

  @Post()
  create(
    @GetUser('id') usuarioId: number,
    @Body() createGastoDto: CreateGastoDto,
  ) {
    return this.gastosService.create(usuarioId, createGastoDto);
  }
}
