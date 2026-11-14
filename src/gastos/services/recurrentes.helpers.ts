import * as nest from '@nestjs/common';
import type { PrismaService } from '../../prisma/prisma.service.js';
import type { CategoriasResolverService } from './categorias-resolver.service.js';
import type { UpdateGastoRecurrenteDto } from '../dto/update-gasto-recurrente.dto.js';
import type { RecurrenciaCalendarioService } from './recurrencia-calendario.service.js';

const noEncontrado = (mensaje: string) => new nest.NotFoundException(mensaje);

/** Busca una regla del usuario o lanza 404. */
export async function buscarRegla(
  prisma: PrismaService,
  usuarioId: number,
  id: number,
) {
  const regla = await prisma.gastoRecurrente.findFirst({
    where: { id, usuarioId },
  });

  if (!regla) throw noEncontrado('Regla recurrente no encontrada');
  return regla;
}

/** Resuelve la categoría de una edición conservando la actual por defecto. */
export async function resolverCategoriaDeRegla(
  categorias: CategoriasResolverService,
  dto: UpdateGastoRecurrenteDto,
  categoriaActual: number,
): Promise<number> {
  if (dto.categoriaId) return dto.categoriaId;
  if (dto.categoria) return categorias.resolverCategoriaId(dto.categoria);
  return categoriaActual;
}

/** Reprograma la regla solo cuando cambia su calendario. */
export function calcularSiCambiaFrecuencia(
  calendario: RecurrenciaCalendarioService,
  dto: UpdateGastoRecurrenteDto,
  regla: {
    frecuencia: string;
    diaMes: number | null;
    diaSemana: number | null;
    proximaEjecucion: Date;
  },
): Date {
  const cambiaCalendario =
    dto.frecuencia || dto.diaMes !== undefined || dto.diaSemana !== undefined;

  if (!cambiaCalendario) return regla.proximaEjecucion;

  return calendario.calcularProximaEjecucion(
    dto.frecuencia ?? regla.frecuencia,
    dto.diaMes ?? regla.diaMes ?? undefined,
    dto.diaSemana ?? regla.diaSemana ?? undefined,
  );
}
