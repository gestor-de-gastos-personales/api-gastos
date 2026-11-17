import * as nj from '../../common/nest.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { UsuariosGastosService } from './usuarios-gastos.service.js';
import { CategoriasResolverService } from './categorias-resolver.service.js';
import { RecurrenciaCalendarioService } from './recurrencia-calendario.service.js';
import type { CreateGastoRecurrenteDto } from '../dto/create-gasto-recurrente.dto.js';
import type { UpdateGastoRecurrenteDto } from '../dto/update-gasto-recurrente.dto.js';
import {
  buscarRegla,
  calcularSiCambiaFrecuencia,
  resolverCategoriaDeRegla,
} from './recurrentes.helpers.js';

/**
 * Alta, listado, edición y baja de reglas recurrentes.
 * La ejecución de reglas vencidas vive en un servicio aparte.
 */
@nj.injectable()
export class GastosRecurrentesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usuarios: UsuariosGastosService,
    private readonly categorias: CategoriasResolverService,
    private readonly calendario: RecurrenciaCalendarioService,
  ) {}

  async createRecurrente(dto: CreateGastoRecurrenteDto) {
    const usuarioId = await this.usuarios.obtenerOCrearUsuarioId(
      dto.usuarioId,
      dto.telegramId,
    );
    const categoriaId = dto.categoriaId
      ? dto.categoriaId
      : await this.categorias.resolverCategoriaId(dto.categoria);

    return this.prisma.gastoRecurrente.create({
      data: {
        usuarioId,
        monto: dto.monto,
        comercio: dto.comercio ?? null,
        categoriaId,
        descripcion: dto.descripcion,
        frecuencia: dto.frecuencia,
        diaSemana: dto.diaSemana ?? null,
        diaMes: dto.diaMes ?? null,
        activo: dto.activo ?? true,
        proximaEjecucion: this.calendario.calcularProximaEjecucion(
          dto.frecuencia,
          dto.diaMes,
          dto.diaSemana,
        ),
      },
      include: { categoria: true },
    });
  }

  async listRecurrentes(
    usuarioIdentifier: number | string,
    telegramId?: string,
  ) {
    const usuarioId = await this.usuarios.obtenerOCrearUsuarioId(
      usuarioIdentifier,
      telegramId,
    );

    return this.prisma.gastoRecurrente.findMany({
      where: { usuarioId },
      include: { categoria: true },
      orderBy: { id: 'desc' },
    });
  }

  async updateRecurrente(
    usuarioIdentifier: number | string,
    id: number,
    dto: UpdateGastoRecurrenteDto,
    telegramId?: string,
  ) {
    const usuarioId = await this.usuarios.obtenerOCrearUsuarioId(
      usuarioIdentifier,
      telegramId,
    );
    const regla = await buscarRegla(this.prisma, usuarioId, id);
    const categoriaId = await resolverCategoriaDeRegla(
      this.categorias,
      dto,
      regla.categoriaId,
    );
    const proximaEjecucion = calcularSiCambiaFrecuencia(
      this.calendario,
      dto,
      regla,
    );

    return this.prisma.gastoRecurrente.update({
      where: { id },
      data: {
        monto: dto.monto ?? regla.monto,
        comercio: dto.comercio ?? regla.comercio,
        categoriaId,
        descripcion: dto.descripcion ?? regla.descripcion,
        frecuencia: dto.frecuencia ?? regla.frecuencia,
        diaSemana: dto.diaSemana ?? regla.diaSemana,
        diaMes: dto.diaMes ?? regla.diaMes,
        activo: dto.activo ?? regla.activo,
        proximaEjecucion,
      },
      include: { categoria: true },
    });
  }

  async removeRecurrente(
    usuarioIdentifier: number | string,
    id: number,
    telegramId?: string,
  ) {
    const usuarioId = await this.usuarios.obtenerOCrearUsuarioId(
      usuarioIdentifier,
      telegramId,
    );
    await buscarRegla(this.prisma, usuarioId, id);

    return this.prisma.gastoRecurrente.delete({ where: { id } });
  }
}
