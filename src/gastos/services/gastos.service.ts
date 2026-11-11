import { Injectable } from '@nestjs/common';
import { GastosDeps } from './gastos-deps.js';
import type { FilterGastosDto } from '../dto/filter-gasto.dto.js';
import type { FilterUltimosDto } from '../dto/filter-ultimos.dto.js';
import type { CreateGastoRecurrenteDto } from '../dto/create-gasto-recurrente.dto.js';
import type { UpdateGastoRecurrenteDto } from '../dto/update-gasto-recurrente.dto.js';
import type { GastoInput, OpcionesResumen, UpdateGastoInput } from '../gastos.types.js';

/**
 * Fachada de gastos.
 *
 * Mantiene el contrato público que consumen los controladores (y que existía
 * cuando todo vivía en un único servicio) pero delega en servicios
 * especializados: consulta, escritura, resumen y recurrentes.
 */
@Injectable()
export class GastosService {
  constructor(private readonly deps: GastosDeps) {}

  // --- Escritura ---
  create(usuarioIdentifier: number | string, dto: GastoInput) {
    return this.deps.escritura.create(usuarioIdentifier, dto);
  }

  update(
    usuarioIdentifier: number | string,
    id: number,
    dto: UpdateGastoInput,
  ) {
    return this.deps.escritura.update(usuarioIdentifier, id, dto);
  }

  remove(usuarioIdentifier: number | string, id: number) {
    return this.deps.escritura.remove(usuarioIdentifier, id);
  }

  // --- Consulta ---
  findAll(usuarioId: number, filtro?: FilterGastosDto) {
    return this.deps.consulta.findAll(usuarioId, filtro);
  }

  findOne(usuarioId: number, id: number) {
    return this.deps.consulta.findOne(usuarioId, id);
  }

  getUltimos(
    usuarioIdentifier: number | string,
    filtro: FilterUltimosDto = {},
  ) {
    return this.deps.consulta.getUltimos(usuarioIdentifier, filtro);
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
    return this.deps.consulta.getUltimoGasto(usuarioIdentifier, dto);
  }

  getGastoById(usuarioIdentifier: number | string, id: number) {
    return this.deps.consulta.getGastoById(usuarioIdentifier, id);
  }

  // --- Resumen ---
  getResumen(
    usuarioIdentifier: number | string,
    filtro: OpcionesResumen = {},
  ) {
    return this.deps.resumen.getResumen(usuarioIdentifier, filtro);
  }

  // --- Recurrentes ---
  createRecurrente(dto: CreateGastoRecurrenteDto) {
    return this.deps.recurrentes.createRecurrente(dto);
  }

  listRecurrentes(
    usuarioIdentifier: number | string,
    telegramId?: string,
  ) {
    return this.deps.recurrentes.listRecurrentes(usuarioIdentifier, telegramId);
  }

  getRecurrentesVencidas() {
    return this.deps.recurrentes.getRecurrentesVencidas();
  }

  updateRecurrente(
    usuarioIdentifier: number | string,
    id: number,
    dto: UpdateGastoRecurrenteDto,
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
    return this.deps.recurrentes.ejecutarRecurrente(reglaId);
  }

  ejecutarVencidas() {
    return this.deps.recurrentes.ejecutarVencidas();
  }

  obtenerYMarcarNotificaciones() {
    return this.deps.recurrentes.obtenerYMarcarNotificaciones();
  }
}
