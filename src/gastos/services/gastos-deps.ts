import * as nest from '@nestjs/common';
import { GastosListadoService } from './gastos-listado.service.js';
import { GastosUltimosService } from './gastos-ultimos.service.js';
import { GastosEscrituraService } from './gastos-escritura.service.js';
import { GastosResumenService } from './gastos-resumen.service.js';
import { GastosRecurrentesService } from './gastos-recurrentes.service.js';
import { GastosRecurrentesEjecucionService } from './gastos-recurrentes-ejecucion.service.js';

/** Contenedor de dependencias de la fachada de gastos. */
@nest.Injectable()
export class GastosDeps {
  constructor(
    readonly listado: GastosListadoService,
    readonly ultimos: GastosUltimosService,
    readonly escritura: GastosEscrituraService,
    readonly resumen: GastosResumenService,
    readonly recurrentes: GastosRecurrentesService,
    readonly ejecucion: GastosRecurrentesEjecucionService,
  ) {}
}
