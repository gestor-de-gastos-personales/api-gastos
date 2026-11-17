import { autenticado, getUser } from '../../auth/decoradores.js';
import * as nj from '../../common/nest.js';
import { GastosService } from '../services/gastos.service.js';
import { CreateGastoDto } from '../dto/create-gasto.dto.js';

@nj.controller('gastos')
@autenticado()
export class GastosAltaController {
  constructor(private readonly gastosService: GastosService) {}

  @nj.post()
  create(
    @getUser('id') usuarioId: number,
    @nj.body() createGastoDto: CreateGastoDto,
  ) {
    return this.gastosService.create(usuarioId, createGastoDto);
  }
}
