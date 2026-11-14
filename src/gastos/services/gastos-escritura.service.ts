import * as nest from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { UsuariosGastosService } from './usuarios-gastos.service.js';
import { GastosListadoService } from './gastos-listado.service.js';
import type * as tipos from '../gastos.types.js';
import * as fechas from '../utils/fechas.js';

/** Resuelve los campos de un gasto aceptando los alias de web y bot. */
function resolverDescripcion(dto: tipos.GastoInput): string {
  const descripcion = dto.descripcion ?? dto.description;
  const comercio = dto.comercio ?? dto.merchant;
  return descripcion || comercio || '';
}

function resolverMonto(dto: tipos.GastoInput): number {
  return Number(dto.valor ?? dto.monto ?? dto.total ?? dto.amount);
}

function resolverCategoria(dto: tipos.GastoInput): string | number | undefined {
  return dto.categoria ?? dto.categoriaId ?? dto.category;
}

/**
 * Escritura de gastos: alta, edición parcial y baja.
 * Siempre resuelve el usuario a su id interno antes de tocar datos.
 */
@nest.Injectable()
export class GastosEscrituraService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usuarios: UsuariosGastosService,
    private readonly consulta: GastosListadoService,
  ) {}

  async create(usuarioIdentifier: number | string, dto: tipos.GastoInput) {
    const usuarioId = await this.usuarios.obtenerOCrearUsuarioId(
      usuarioIdentifier,
      dto.telegramId,
    );
    const categoriaId = await this.usuarios.resolverCategoriaId(
      resolverCategoria(dto),
    );

    return this.prisma.gasto.create({
      data: {
        descripcion: resolverDescripcion(dto),
        monto: resolverMonto(dto),
        fecha: dto.fecha ? fechas.parseFechaArg(dto.fecha) : new Date(),
        categoria: { connect: { id: categoriaId } },
        usuario: { connect: { id: usuarioId } },
      },
    });
  }

  async update(
    usuarioIdentifier: number | string,
    id: number,
    dto: tipos.UpdateGastoInput,
  ) {
    const usuarioId = await this.usuarios.resolverUsuarioId(usuarioIdentifier);
    await this.consulta.buscarGasto(usuarioId, id);

    const categoriaInput = resolverCategoria(dto);
    const categoriaId =
      categoriaInput !== undefined && categoriaInput !== null
        ? await this.usuarios.resolverCategoriaId(categoriaInput)
        : undefined;

    const descripcion =
      dto.descripcion ?? dto.description ?? dto.comercio ?? dto.merchant;
    const monto = dto.monto ?? dto.valor ?? dto.total ?? dto.amount;
    const fecha = dto.fecha ?? dto.date;

    return this.prisma.gasto.update({
      where: { id },
      data: {
        ...(descripcion !== undefined && { descripcion }),
        ...(monto !== undefined && { monto: Number(monto) }),
        ...(categoriaId !== undefined && {
          categoria: { connect: { id: categoriaId } },
        }),
        ...(fecha !== undefined && { fecha: fechas.parseFechaArg(fecha) }),
      },
      include: { categoria: true },
    });
  }

  async remove(usuarioIdentifier: number | string, id: number) {
    const usuarioId = await this.usuarios.resolverUsuarioId(usuarioIdentifier);
    await this.consulta.buscarGasto(usuarioId, id);

    return this.prisma.gasto.delete({ where: { id } });
  }
}
