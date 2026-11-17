import * as nj from '../../common/nest.js';
import { GastosDeps } from './gastos-deps.js';
import type * as f from '../tipos-facade.js';

/**
 * Fachada de gastos.
 *
 * Mantiene el contrato público que consumen los controladores (y que existía
 * cuando todo vivía en un único servicio) pero delega en servicios
 * especializados: consulta, escritura, resumen y recurrentes.
 */
@nj.injectable()
export class GastosService {
  constructor(private readonly deps: GastosDeps) {}

  // --- Escritura ---
  create(usuarioIdentifier: number | string, dto: f.gastoInput) {
    return this.deps.escritura.create(usuarioIdentifier, dto);
  }

  update(
    usuarioIdentifier: number | string,
    id: number,
    dto: f.updateGastoInput,
  ) {
    return this.deps.escritura.update(usuarioIdentifier, id, dto);
  }

  remove(usuarioIdentifier: number | string, id: number) {
    return this.deps.escritura.remove(usuarioIdentifier, id);
  }

  // --- Consulta ---
  findAll(usuarioId: number, filtro?: f.filtroGastos) {
    return this.deps.listado.findAll(usuarioId, filtro);
  }

  findOne(usuarioId: number, id: number) {
    return this.deps.listado.findOne(usuarioId, id);
  }

  getUltimos(
    usuarioIdentifier: number | string,
    filtro: f.filtroUltimos = {},
  ) {
    return this.deps.ultimos.getUltimos(usuarioIdentifier, filtro);
  }

  getUltimoGasto(
    usuarioIdentifier: number | string,
    dto: {
      telegramId?: string;
      comercio?: string;
      categoria?: string;
      desde?: string;
    },
  ) {
    return this.deps.ultimos.getUltimoGasto(usuarioIdentifier, dto);
  }

  getGastoById(usuarioIdentifier: number | string, id: number) {
    return this.deps.listado.getGastoById(usuarioIdentifier, id);
  }

  // --- Resumen ---
  getResumen(
    usuarioIdentifier: number | string,
    filtro: f.opcionesResumen = {},
  ) {
    return this.deps.resumen.getResumen(usuarioIdentifier, filtro);
  }

  // --- Recurrentes ---
  createRecurrente(dto: f.crearRecurrente) {
    return this.deps.recurrentes.createRecurrente(dto);
  }

  listRecurrentes(
    usuarioIdentifier: number | string,
    telegramId?: string,
  ) {
    return this.deps.recurrentes.listRecurrentes(usuarioIdentifier, telegramId);
  }

  getRecurrentesVencidas() {
    return this.deps.ejecucion.getRecurrentesVencidas();
  }

  updateRecurrente(
    usuarioIdentifier: number | string,
    id: number,
    dto: f.actualizarRecurrente,
    telegramId?: string,
  ) {
    return this.deps.recurrentes.updateRecurrente(
      usuarioIdentifier,
      id,
      dto,
      telegramId,
    );
  }

  removeRecurrente(
    usuarioIdentifier: number | string,
    id: number,
    telegramId?: string,
  ) {
    return this.deps.recurrentes.removeRecurrente(
      usuarioIdentifier,
      id,
      telegramId,
    );
  }

  ejecutarRecurrente(reglaId: number) {
    return this.deps.ejecucion.ejecutarRecurrente(reglaId);
  }

  ejecutarVencidas() {
    return this.deps.ejecucion.ejecutarVencidas();
  }

  obtenerYMarcarNotificaciones() {
    return this.deps.ejecucion.obtenerYMarcarNotificaciones();
  }
}
