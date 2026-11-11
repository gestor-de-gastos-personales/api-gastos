/**
 * Tipos compartidos por los servicios de gastos.
 */

/** Rangos de tiempo admitidos por los resúmenes. */
export type RangoResumen =
  | 'TODAY'
  | 'WEEK'
  | '15_DAYS'
  | 'MONTH'
  | '2_MONTHS'
  | 'YEAR';

/** Opciones de período que aceptan los resúmenes web y del bot. */
export interface OpcionesResumen {
  mes?: number;
  anio?: number;
  desde?: string;
  hasta?: string;
  rango?: RangoResumen;
  /** Nombre de categoría (case-insensitive) para filtrar el resumen. */
  categoria?: string;
}

/** Período ya resuelto y listo para consultar la base de datos. */
export interface PeriodoResumen {
  mes: number | null;
  anio: number;
  rango: RangoResumen | null;
  fechaInicio: Date;
  fechaFin: Date;
}

/**
 * Entrada normalizada para crear un gasto. Acepta los alias que usan
 * tanto la API web como el bot de Telegram.
 */
export interface GastoInput {
  descripcion?: string;
  description?: string;
  valor?: number;
  monto?: number;
  total?: number;
  amount?: number;
  fecha?: string;
  date?: string;
  categoria?: string | number;
  categoriaId?: number;
  category?: string;
  comercio?: string;
  merchant?: string;
  telegramId?: string;
}

/** Entrada de una actualización parcial: todos los campos son opcionales. */
export type UpdateGastoInput = GastoInput;

/** Resultado agregado por categoría que devuelve el resumen. */
export interface GrupoResumen {
  categoriaId: number;
  categoriaNombre: string;
  total: number;
  porcentaje: number;
}

/** Gasto destacado dentro de un resumen (el de mayor monto). */
export interface MayorGastoResumen {
  id: number;
  monto: number;
  descripcion: string;
  fecha: Date;
  categoria: { id: number; nombre: string } | null;
}

/** Contrato de respuesta de `getResumen`. */
export interface ResumenGastos {
  periodo: PeriodoResumen;
  totalGeneral: number;
  porCategoria: GrupoResumen[];
  mayorGasto: MayorGastoResumen | null;
  cantidad: number;
}

/** Gasto con la fecha legible que consumen los listados. */
export interface GastoConFecha<T> {
  fechaFormateada: string;
  gasto: T;
}

/** Agrupación admitida por la serie temporal de gastos. */
export type AgrupacionSerie = 'dia' | 'semana' | 'mes';

/** Punto de la serie temporal (clave ISO + etiqueta legible). */
export interface PuntoSerie {
  clave: string;
  etiqueta: string;
  total: number;
}

/** Serie de totales por período para los gráficos del dashboard. */
export interface SerieGastos {
  desde: string;
  hasta: string;
  agrupacion: AgrupacionSerie;
  puntos: PuntoSerie[];
  totalGeneral: number;
}
