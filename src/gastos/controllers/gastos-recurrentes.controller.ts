import * as nest from '@nestjs/common';
import { GastosService } from '../services/gastos.service.js';
import * as DTO from '../dto/index.js';

@nest.Controller('gastos/recurrentes')
export class GastosRecurrentesController {
  constructor(private readonly gastosService: GastosService) {}

  @nest.Post()
  create(@nest.Body() dto: DTO.CreateGastoRecurrenteDto) {
    return this.gastosService.createRecurrente(dto);
  }

  @nest.Get()
  findAll(@nest.Query('usuarioId') usuarioId?: string, @nest.Query('telegramId') telegramId?: string) {
    const id = usuarioId ?? telegramId ?? '0';
    return this.gastosService.listRecurrentes(id, telegramId);
  }

  @nest.Get('vencidas')
  vencidas() {
    return this.gastosService.getRecurrentesVencidas();
  }

  @nest.Post('ejecutar')
  ejecutar(@nest.Body() body: { reglaId?: number }) {
    if (body.reglaId) {
      return this.gastosService.ejecutarRecurrente(body.reglaId);
    }
    return this.gastosService.getRecurrentesVencidas().then((reglas) =>
      Promise.all(reglas.map((regla) => this.gastosService.ejecutarRecurrente(regla.id))),
    );
  }

  @nest.Patch(':id')
  update(
    @nest.Param('id') id: string,
    @nest.Body() dto: DTO.UpdateGastoRecurrenteDto,
    @nest.Query('usuarioId') usuarioId?: string,
    @nest.Query('telegramId') telegramId?: string,
  ) {
    const user = usuarioId ?? telegramId ?? '0';
    return this.gastosService.updateRecurrente(user, Number(id), dto, telegramId);
  }

  @nest.Delete(':id')
  remove(
    @nest.Param('id') id: string,
    @nest.Query('usuarioId') usuarioId?: string,
    @nest.Query('telegramId') telegramId?: string,
  ) {
    const user = usuarioId ?? telegramId ?? '0';
    return this.gastosService.removeRecurrente(user, Number(id), telegramId);
  }
}
