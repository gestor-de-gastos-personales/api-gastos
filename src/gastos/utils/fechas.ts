import { BadRequestException } from '@nestjs/common';
import type {
  OpcionesResumen,
  PeriodoResumen,
  RangoResumen,
} from '../gastos.types.js';

const FORMATO_ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Convierte fechas ISO (`YYYY-MM-DD`) o el formato legado
 * (`DD-MM-YYYY`) a un Date en UTC.
 */
export function parseFechaArg(fechaStr: string, esFinDeDia = false): Date {
  const hora = esFinDeDia ? '23:59:59.999Z' : '00:00:00.000Z';
  const iso = FORMATO_ISO.exec(fechaStr);

  if (iso) {
    return new Date(`${iso[1]}-${iso[2]}-${iso[3]}T${hora}`);
  }

  const [dia, mes, anio] = fechaStr.split('-');
  return new Date(`${anio}-${mes}-${dia}T${hora}`);
}

/** Convierte una fecha ISO completa o `YYYY-MM-DD`. */
export function parseFechaISO(valor: string, esFinDeDia: boolean): Date {
  const fecha = new Date(valor);

  if (Number.isNaN(fecha.getTime())) {
    throw new BadRequestException(`La fecha '${valor}' no es válida`);
  }

  if (esFinDeDia && FORMATO_ISO.test(valor)) {
    fecha.setUTCHours(23, 59, 59, 999);
  }

  return fecha;
}

/** Formatea una fecha como `DD-MM-YYYY` para los listados. */
export function formatearFecha(fecha: Date): string {
  const [anio, mes, dia] = fecha.toISOString().slice(0, 10).split('-');
  return `${dia}-${mes}-${anio}`;
}

/** Agrega la fecha legible que consumen los listados. */
export function conFechaFormateada<T extends { fecha: Date }>(gasto: T) {
  return { ...gasto, fechaFormateada: formatearFecha(gasto.fecha) };
}

/** Calcula el inicio de cada rango soportado sin anidar condicionales. */
export function inicioDelRango(rango: RangoResumen, ahora: Date): Date {
  const anio = ahora.getUTCFullYear();
  const mes = ahora.getUTCMonth();
  const dia = ahora.getUTCDate();
  const diasDesdeLunes = (ahora.getUTCDay() + 6) % 7;

  const inicios: Record<RangoResumen, Date> = {
    TODAY: new Date(Date.UTC(anio, mes, dia)),
    WEEK: new Date(Date.UTC(anio, mes, dia - diasDesdeLunes)),
    '15_DAYS': new Date(Date.UTC(anio, mes, dia - 14)),
    MONTH: new Date(Date.UTC(anio, mes, 1)),
    '2_MONTHS': new Date(Date.UTC(anio, mes - 2, dia)),
    YEAR: new Date(Date.UTC(anio, 0, 1)),
  };

  return inicios[rango];
}

function periodoExplicito(opciones: OpcionesResumen): PeriodoResumen {
  const fechaInicio = opciones.desde
    ? parseFechaISO(opciones.desde, false)
    : new Date(Date.UTC(2000, 0, 1));
  const fechaFin = opciones.hasta
    ? parseFechaISO(opciones.hasta, true)
    : new Date();

  if (fechaInicio > fechaFin) {
    throw new BadRequestException(
      'La fecha desde no puede ser posterior a la fecha hasta',
    );
  }

  return {
    mes: null,
    anio: fechaFin.getUTCFullYear(),
    rango: null,
    fechaInicio,
    fechaFin,
  };
}

function periodoPorRango(rango: RangoResumen): PeriodoResumen {
  const ahora = new Date();

  return {
    mes: null,
    anio: ahora.getUTCFullYear(),
    rango,
    fechaInicio: inicioDelRango(rango, ahora),
    fechaFin: ahora,
  };
}

function periodoPorMes(opciones: OpcionesResumen): PeriodoResumen {
  const ahora = new Date();
  const anio = opciones.anio ? Number(opciones.anio) : ahora.getUTCFullYear();
  const mes = opciones.mes ? Number(opciones.mes) : undefined;

  if (mes) {
    return {
      mes,
      anio,
      rango: null,
      fechaInicio: new Date(Date.UTC(anio, mes - 1, 1)),
      fechaFin: new Date(Date.UTC(anio, mes, 0, 23, 59, 59, 999)),
    };
  }

  return {
    mes: null,
    anio,
    rango: null,
    fechaInicio: new Date(Date.UTC(anio, 0, 1)),
    fechaFin: new Date(Date.UTC(anio, 11, 31, 23, 59, 59, 999)),
  };
}

/** Resuelve el período del resumen priorizando fechas explícitas y rangos. */
export function resolverPeriodo(opciones: OpcionesResumen): PeriodoResumen {
  if (opciones.desde || opciones.hasta) {
    return periodoExplicito(opciones);
  }

  if (opciones.rango) {
    return periodoPorRango(opciones.rango);
  }

  return periodoPorMes(opciones);
}
