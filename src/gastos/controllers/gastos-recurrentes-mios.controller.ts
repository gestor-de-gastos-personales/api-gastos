import { Body, Controller, Get, Post } from '@nestjs/common';
import { Autenticado } from '../../auth/decorators/autenticado.decorator.js';
import { GetUser } from '../../auth/decorators/get-user.decorator.js';
import { CreateGastoRecurrenteMioDto } from '../dto/create-gasto-recurrente-mio.dto.js';
import { GastosService } from '../services/gastos.service.js';

@Controller('gastos/recurrentes/mios')
@Autenticado()
export class GastosRecurrentesMiosController {
  constructor(private readonly gastosService: GastosService) {}

  @Post()
  create(
    @GetUser('id') usuarioId: number,
    @Body() dto: CreateGastoRecurrenteMioDto,
  ) {
    return this.gastosService.createRecurrente({ ...dto, usuarioId });
  }

  @Get()
  findAll(@GetUser('id') usuarioId: number) {
    return this.gastosService.listRecurrentes(usuarioId);
  }
}
