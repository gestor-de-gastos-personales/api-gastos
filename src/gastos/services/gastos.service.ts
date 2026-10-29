import { Injectable } from '@nestjs/common';
import { GastosConsultaService } from './gastos-consulta.service.js';
import { GastosEscrituraService } from './gastos-escritura.service.js';
import { GastosResumenService } from './gastos-resumen.service.js';
import { GastosRecurrentesService } from './gastos-recurrentes.service.js';
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
  constructor(
    private readonly consulta: GastosConsultaService,
    private readonly escritura: GastosEscrituraService,
    private readonly resumen: GastosResumenService,
    private readonly recurrentes: GastosRecurrentesService,
  ) {}

  // --- Escritura ---
  create(usuarioIdentifier: number | string, dto: GastoInput) {
    return this.escritura.create(usuarioIdentifier, dto);
  }

  update(
    usuarioIdentifier: number | string,
    id: number,
    dto: UpdateGastoInput,
  ) {
    return this.escritura.update(usuarioIdentifier, id, dto);
  }

  remove(usuarioIdentifier: number | string, id: number) {
    return this.escritura.remove(usuarioIdentifier, id);
  }

  // --- Consulta ---
  findAll(usuarioId: number, filtro?: FilterGastosDto) {
    return this.consulta.findAll(usuarioId, filtro);
  }

  findOne(usuarioId: number, id: number) {
    return this.consulta.findOne(usuarioId, id);
  }

  getUltimos(
    usuarioIdentifier: number | string,
    filtro: FilterUltimosDto = {},
  ) {
    return this.consulta.getUltimos(usuarioIdentifier, filtro);
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
    return this.consulta.getUltimoGasto(usuarioIdentifier, dto);
  }

  getGastoById(usuarioIdentifier: number | string, id: number) {
    return this.consulta.getGastoById(usuarioIdentifier, id);
  }

  // --- Resumen ---
  getResumen(
    usuarioIdentifier: number | string,
    filtro: OpcionesResumen = {},
  ) {
    return this.resumen.getResumen(usuarioIdentifier, filtro);
  }

  // --- Recurrentes ---
  createRecurrente(dto: CreateGastoRecurrenteDto) {
    return this.recurrentes.createRecurrente(dto);
  }

  listRecurrentes(
    usuarioIdentifier: number | string,
    telegramId?: string,
  ) {
    return this.recurrentes.listRecurrentes(usuarioIdentifier, telegramId);
  }

  getRecurrentesVencidas() {
    return this.recurrentes.getRecurrentesVencidas();
  }

  updateRecurrente(
    usuarioIdentifier: number | string,
    id: number,
    dto: UpdateGastoRecurrenteDto,
    telegramId?: string,
  ) {
    return this.recurrentes.updateRecurrente(
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
    return this.recurrentes.removeRecurrente(
      usuarioIdentifier,
      id,
      telegramId,
    );
  }

  ejecutarRecurrente(reglaId: number) {
    return this.recurrentes.ejecutarRecurrente(reglaId);
  }

  ejecutarVencidas() {
    return this.recurrentes.ejecutarVencidas();
  }

  obtenerYMarcarNotificaciones() {
    return this.recurrentes.obtenerYMarcarNotificaciones();
  }
}
