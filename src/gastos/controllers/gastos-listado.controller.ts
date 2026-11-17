import { autenticado, getUser } from '../../auth/decoradores.js';
import * as nj from '../../common/nest.js';
import { GastosService } from '../services/gastos.service.js';
import { FilterGastosDto } from '../dto/filter-gasto.dto.js';

@nj.controller('gastos')
@autenticado()
export class GastosListadoController {
  constructor(private readonly gastosService: GastosService) {}

  @nj.get()
  findAll(
    @getUser('id') usuarioId: number,
    @nj.query() filterDto: FilterGastosDto,
  ) {
    return this.gastosService.findAll(usuarioId, filterDto);
  }
}
