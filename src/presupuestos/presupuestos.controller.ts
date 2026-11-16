import { autenticado, getUser } from '../auth/decoradores.js';
import * as nj from '../common/nest.js';
import { PresupuestosService } from './presupuestos.service.js';
import * as DTO from './dto/index.js';

@nj.controller('presupuestos')
export class PresupuestosController {
  constructor(private readonly presupuestosService: PresupuestosService) {}

  @nj.get()
  listar(
    @nj.query('telegramId') telegramId?: string,
    @nj.query('mes') mes?: string,
    @nj.query('anio') anio?: string,
  ) {
    return this.presupuestosService.listar(
      telegramId ?? '',
      mes !== undefined ? Number(mes) : undefined,
      anio !== undefined ? Number(anio) : undefined,
    );
  }

  @nj.post()
  guardar(@nj.body() dto: DTO.CreatePresupuestoDto) {
    return this.presupuestosService.guardar(dto);
  }

  /** Presupuestos del usuario autenticado (web). */
  @nj.get('mios')
  @autenticado()
  listarMios(
    @getUser('id') usuarioId: number,
    @nj.query('mes') mes?: string,
    @nj.query('anio') anio?: string,
  ) {
    return this.presupuestosService.listarPorUsuario(
      usuarioId,
      mes !== undefined ? Number(mes) : undefined,
      anio !== undefined ? Number(anio) : undefined,
    );
  }

  @nj.post('mios')
  @autenticado()
  guardarMio(
    @getUser('id') usuarioId: number,
    @nj.body() dto: DTO.PresupuestoMioDto,
  ) {
    return this.presupuestosService.guardarParaUsuario(usuarioId, dto);
  }
}
