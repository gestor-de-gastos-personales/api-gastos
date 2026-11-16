import { autenticado, getUser } from '../../auth/decoradores.js';
import * as nj from '../../common/nest.js';
import { GastosService } from '../services/gastos.service.js';
import { FilterResumenDto } from '../dto/filter-resumen.dto.js';

@nj.controller('gastos/resumen')
@autenticado()
export class GastosResumenController {
  constructor(private readonly gastosService: GastosService) {}

  @nj.get()
  getResumen(
    @getUser('id') usuarioId: number,
    @nj.query() filterDto: FilterResumenDto,
  ) {
    return this.gastosService.getResumen(usuarioId, filterDto);
  }
}
