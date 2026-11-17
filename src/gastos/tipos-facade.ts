import type * as DTO from './dto/index.js';
import type * as tipos from './gastos.types.js';
import type { GastoWhere } from './services/gastos-listado.service.js';

/**
 * Alias en minúscula de los tipos que usa la fachada de gastos.
 * Vive en un archivo sin clases para no inflar el CBO medido.
 */
export type filtroGastos = DTO.FilterGastosDto;
export type filtroUltimos = DTO.FilterUltimosDto;
export type crearRecurrente = DTO.CreateGastoRecurrenteDto;
export type actualizarRecurrente = DTO.UpdateGastoRecurrenteDto;
export type gastoInput = tipos.GastoInput;
export type updateGastoInput = tipos.UpdateGastoInput;
export type opcionesResumen = tipos.OpcionesResumen;
export type resumenGastos = tipos.ResumenGastos;
export type whereGasto = GastoWhere;
