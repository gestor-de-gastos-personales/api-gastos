import * as nest from '@nestjs/common';
import { Autenticado } from '../../auth/decorators/autenticado.decorator.js';
import { GetUser } from '../../auth/decorators/get-user.decorator.js';
import * as DTO from '../dto/index.js';
import { GastosService } from '../services/gastos.service.js';

@nest.Controller('gastos/recurrentes/mios')
@Autenticado()
export class GastosRecurrentesMiosController {
  constructor(private readonly gastosService: GastosService) {}

  @nest.Post()
  create(
    @GetUser('id') usuarioId: number,
    @nest.Body() dto: DTO.CreateGastoRecurrenteMioDto,
  ) {
    return this.gastosService.createRecurrente({ ...dto, usuarioId });
  }

  @nest.Get()
  findAll(@GetUser('id') usuarioId: number) {
    return this.gastosService.listRecurrentes(usuarioId);
  }
}
