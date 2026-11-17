import { autenticado, getUser } from '../../auth/decoradores.js';
import * as nj from '../../common/nest.js';
import * as DTO from '../dto/index.js';
import { GastosService } from '../services/gastos.service.js';

@nj.controller('gastos/recurrentes/mios')
@autenticado()
export class GastosRecurrentesMiosController {
  constructor(private readonly gastosService: GastosService) {}

  @nj.post()
  create(
    @getUser('id') usuarioId: number,
    @nj.body() dto: DTO.CreateGastoRecurrenteMioDto,
  ) {
    return this.gastosService.createRecurrente({ ...dto, usuarioId });
  }

  @nj.get()
  findAll(@getUser('id') usuarioId: number) {
    return this.gastosService.listRecurrentes(usuarioId);
  }
}
