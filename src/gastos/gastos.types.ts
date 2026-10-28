/**
 * Entrada normalizada para crear un gasto. Acepta los alias que usan
 * tanto la API web como el bot de Telegram.
 */
/** Rangos de tiempo admitidos por el resumen del bot. */
export type RangoResumen =
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
}

/** Período ya resuelto y listo para consultar la base de datos. */
export interface PeriodoResumen {
  mes: number | null;
  anio: number;
  rango: RangoResumen | null;
  fechaInicio: Date;
  fechaFin: Date;
}

export interface GastoInput {
  descripcion?: string;
  description?: string;
  valor?: number;
  monto?: number;
  total?: number;
  fecha?: string;
  categoria?: string | number;
  category?: string;
  comercio?: string;
  merchant?: string;
  telegramId?: string;
}
