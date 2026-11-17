import * as nj from '../../common/nest.js';
import { PrismaService } from '../../prisma/prisma.service.js';

const noEncontrado = (mensaje: string) => new nj.noEncontrado(mensaje);

/** Resuelve categorías por id o por nombre para los gastos. */
@nj.injectable()
export class CategoriasResolverService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Resuelve una categoría por ID o por nombre (case-insensitive).
   */
  async resolverCategoriaId(catInput?: string | number): Promise<number> {
    if (catInput !== undefined && catInput !== null && catInput !== '') {
      const esNumerico =
        typeof catInput === 'number' ||
        (!isNaN(Number(catInput)) && Number.isInteger(Number(catInput)));

      if (esNumerico) {
        const porId = await this.prisma.categoria.findUnique({
          where: { id: Number(catInput) },
        });
        if (porId) return porId.id;
      }

      const porNombre = await this.prisma.categoria.findFirst({
        where: {
          nombre: {
            equals: String(catInput),
            mode: 'insensitive',
          },
        },
      });
      if (porNombre) return porNombre.id;
    }

    throw noEncontrado(
      `La categoría '${catInput}' no existe en la base de datos.`,
    );
  }

  /**
   * Busca una categoría por nombre sin lanzar excepción. Devuelve `null`
   * cuando no existe, para que el llamador decida el fallback.
   */
  async buscarCategoriaPorNombre(nombre: string) {
    return this.prisma.categoria.findFirst({
      where: { nombre: { equals: nombre, mode: 'insensitive' } },
    });
  }
}
