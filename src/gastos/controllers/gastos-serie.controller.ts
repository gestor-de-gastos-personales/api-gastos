import { autenticado, getUser } from '../../auth/decoradores.js';
import * as nj from '../../common/nest.js';
import { GastosSerieService } from '../services/gastos-serie.service.js';
import { SerieQueryDto } from '../dto/serie-query.dto.js';

/**
 * Serie temporal del usuario autenticado para los gráficos del dashboard.
 * Se registra antes del controlador de detalle para que `serie` no se
 * interprete como un `:id`.
 */
@nj.controller('gastos')
@autenticado()
export class GastosSerieController {
  constructor(private readonly gastosSerie: GastosSerieService) {}

  @nj.get('serie')
  getSerie(
    @getUser('id') usuarioId: number,
    @nj.query() filtro: SerieQueryDto,
  ) {
    return this.gastosSerie.getSerie(usuarioId, filtro);
  }
}
