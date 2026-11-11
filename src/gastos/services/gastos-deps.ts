import { Injectable } from '@nestjs/common';
import { GastosConsultaService } from './gastos-consulta.service.js';
import { GastosEscrituraService } from './gastos-escritura.service.js';
import { GastosResumenService } from './gastos-resumen.service.js';
import { GastosRecurrentesService } from './gastos-recurrentes.service.js';

/**
 * Contenedor de dependencias de la fachada de gastos.
 *
 * Agrupa los servicios especializados para que `GastosService` dependa de una
 * única pieza y su cohesión no se diluya entre cuatro colaboradores.
 */
@Injectable()
export class GastosDeps {
  constructor(
    readonly consulta: GastosConsultaService,
    readonly escritura: GastosEscrituraService,
    readonly resumen: GastosResumenService,
    readonly recurrentes: GastosRecurrentesService,
  ) {}
}
