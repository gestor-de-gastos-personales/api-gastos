import * as nj from '../../common/nest.js';
import { GastosService } from '../services/gastos.service.js';
import * as DTO from '../dto/index.js';

@nj.controller('gastos/recurrentes')
export class GastosRecurrentesController {
  constructor(private readonly gastosService: GastosService) {}

  @nj.post()
  create(@nj.body() dto: DTO.CreateGastoRecurrenteDto) {
    return this.gastosService.createRecurrente(dto);
  }

  @nj.get()
  findAll(@nj.query('usuarioId') usuarioId?: string, @nj.query('telegramId') telegramId?: string) {
    const id = usuarioId ?? telegramId ?? '0';
    return this.gastosService.listRecurrentes(id, telegramId);
  }

  @nj.get('vencidas')
  vencidas() {
    return this.gastosService.getRecurrentesVencidas();
  }

  @nj.post('ejecutar')
  ejecutar(@nj.body() body: { reglaId?: number }) {
    if (body.reglaId) {
      return this.gastosService.ejecutarRecurrente(body.reglaId);
    }
    return this.gastosService.getRecurrentesVencidas().then((reglas) =>
      Promise.all(reglas.map((regla) => this.gastosService.ejecutarRecurrente(regla.id))),
    );
  }

  @nj.patch(':id')
  update(
    @nj.param('id') id: string,
    @nj.body() dto: DTO.UpdateGastoRecurrenteDto,
    @nj.query('usuarioId') usuarioId?: string,
    @nj.query('telegramId') telegramId?: string,
  ) {
    const user = usuarioId ?? telegramId ?? '0';
    return this.gastosService.updateRecurrente(user, Number(id), dto, telegramId);
  }

  @nj.del(':id')
  remove(
    @nj.param('id') id: string,
    @nj.query('usuarioId') usuarioId?: string,
    @nj.query('telegramId') telegramId?: string,
  ) {
    const user = usuarioId ?? telegramId ?? '0';
    return this.gastosService.removeRecurrente(user, Number(id), telegramId);
  }
}
