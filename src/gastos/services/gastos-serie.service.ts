import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { UsuariosGastosService } from './usuarios-gastos.service.js';
import { resolverPeriodo } from '../utils/fechas.js';
import type { SerieQueryDto } from '../dto/serie-query.dto.js';
import type {
  AgrupacionSerie,
  PuntoSerie,
  SerieGastos,
} from '../gastos.types.js';

/** Tope de puntos para no generar series gigantes por pedidos accidentales. */
const MAX_PUNTOS = 400;

const iso = (fecha: Date) => fecha.toISOString().slice(0, 10);
const redondear = (n: number) => Number(n.toFixed(2));

/** Lunes (UTC) de la semana a la que pertenece la fecha. */
function inicioSemana(fecha: Date): Date {
  const dia = new Date(
    Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate()),
  );
  const desdeLunes = (dia.getUTCDay() + 6) % 7;
  dia.setUTCDate(dia.getUTCDate() - desdeLunes);
  return dia;
}

/** Clave estable de la agrupación: `YYYY-MM-DD`, `YYYY-MM` o lunes ISO. */
function claveDe(fecha: Date, agrupacion: AgrupacionSerie): string {
  if (agrupacion === 'mes') return fecha.toISOString().slice(0, 7);
  if (agrupacion === 'semana') return iso(inicioSemana(fecha));
  return iso(fecha);
}

/** Etiqueta legible para el eje del gráfico. */
function etiquetaDe(clave: string, agrupacion: AgrupacionSerie): string {
  if (agrupacion === 'mes') {
    const [anio, mes] = clave.split('-');
    return `${mes}/${anio}`;
  }

  const [, mes, dia] = clave.split('-');
  return `${dia}/${mes}`;
}

/** Genera todas las claves del período, incluidas las que no tienen gastos. */
function generarClaves(
  desde: Date,
  hasta: Date,
  agrupacion: AgrupacionSerie,
): string[] {
  const claves: string[] = [];
  const cursor =
    agrupacion === 'semana'
      ? inicioSemana(desde)
      : agrupacion === 'mes'
        ? new Date(Date.UTC(desde.getUTCFullYear(), desde.getUTCMonth(), 1))
        : new Date(
            Date.UTC(
              desde.getUTCFullYear(),
              desde.getUTCMonth(),
              desde.getUTCDate(),
            ),
          );

  while (cursor <= hasta) {
    if (claves.length >= MAX_PUNTOS) {
      throw new BadRequestException(
        'El rango es demasiado grande: reducí las fechas o usá una agrupación mayor.',
      );
    }

    claves.push(claveDe(cursor, agrupacion));

    if (agrupacion === 'dia') cursor.setUTCDate(cursor.getUTCDate() + 1);
    else if (agrupacion === 'semana') cursor.setUTCDate(cursor.getUTCDate() + 7);
    else cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }

  return claves;
}

/**
 * Serie temporal de gastos por día, semana o mes.
 * Alimenta el gráfico de evolución del dashboard web.
 */
@Injectable()
export class GastosSerieService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usuarios: UsuariosGastosService,
  ) {}

  async getSerie(
    usuarioIdentifier: number | string,
    filtro: SerieQueryDto = {},
  ): Promise<SerieGastos> {
    const usuarioId =
      await this.usuarios.obtenerOCrearUsuarioId(usuarioIdentifier);
    const periodo = resolverPeriodo({
      desde: filtro.desde,
      hasta: filtro.hasta,
    });
    const agrupacion = filtro.agrupacion ?? 'dia';
    const claves = generarClaves(
      periodo.fechaInicio,
      periodo.fechaFin,
      agrupacion,
    );

    const gastos = await this.prisma.gasto.findMany({
      where: {
        usuarioId,
        fecha: { gte: periodo.fechaInicio, lte: periodo.fechaFin },
      },
      select: { fecha: true, monto: true },
    });

    const acumulado = new Map<string, number>();
    for (const gasto of gastos) {
      const clave = claveDe(gasto.fecha, agrupacion);
      acumulado.set(clave, (acumulado.get(clave) ?? 0) + Number(gasto.monto));
    }

    const puntos: PuntoSerie[] = claves.map((clave) => ({
      clave,
      etiqueta: etiquetaDe(clave, agrupacion),
      total: redondear(acumulado.get(clave) ?? 0),
    }));

    return {
      desde: iso(periodo.fechaInicio),
      hasta: iso(periodo.fechaFin),
      agrupacion,
      puntos,
      totalGeneral: redondear(
        puntos.reduce((acumuladoTotal, punto) => acumuladoTotal + punto.total, 0),
      ),
    };
  }
}
