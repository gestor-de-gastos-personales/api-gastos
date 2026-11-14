import * as servicios from './services/index.js';
import * as controladores from './controllers/index.js';
import { GastosRecurrentesScheduler } from './scheduler/gastos-recurrentes.scheduler.js';

/** Providers del módulo de gastos, agrupados para mantener el módulo legible. */
export const GASTOS_PROVIDERS = [
  servicios.GastosService,
  servicios.GastosDeps,
  servicios.GastosListadoService,
  servicios.GastosUltimosService,
  servicios.GastosEscrituraService,
  servicios.GastosResumenService,
  servicios.ResumenAgrupadoService,
  servicios.ResumenMayorGastoService,
  servicios.GastosRecurrentesService,
  servicios.GastosSerieService,
  servicios.UsuariosGastosService,
  servicios.CategoriasResolverService,
  GastosRecurrentesScheduler,
];

/** Controladores de gastos en el orden que exige el ruteo literal antes de `:id`. */
export const GASTOS_CONTROLLERS = [
  controladores.GastosBotController,
  controladores.GastosResumenController,
  controladores.GastosRecurrentesController,
  controladores.GastosRecurrentesMiosController,
  controladores.GastosSerieController,
  controladores.GastosAltaController,
  controladores.GastosListadoController,
  controladores.GastosDetalleController,
];
