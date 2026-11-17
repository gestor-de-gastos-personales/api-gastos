import * as nj from '../../common/nest.js';
import { PrismaService } from '../../prisma/prisma.service.js';

const noEncontrado = (mensaje: string) => new nj.noEncontrado(mensaje);

/**
 * Resuelve las entidades de referencia de un gasto: el usuario (por id
 * interno o por `telegramId`) y la categoría (por id o por nombre).
 *
 * Se aísla para que los servicios de consulta, escritura y resumen no
 * repitan la misma lógica de resolución.
 */
@nj.injectable()
export class UsuariosGastosService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Devuelve el id interno del usuario. Si llega un `telegramId` que todavía
   * no existe, crea un usuario provisorio (alta desde el bot).
   */
  async obtenerOCrearUsuarioId(
    usuarioIdentifier: number | string,
    dtoTelegramId?: string,
  ): Promise<number> {
    const tgId =
      dtoTelegramId ||
      (typeof usuarioIdentifier === 'string' ? usuarioIdentifier : null);

    if (!tgId) {
      return Number(usuarioIdentifier);
    }

    const existente = await this.prisma.usuario.findFirst({
      where: { telegramId: String(tgId) },
    });

    if (existente) {
      return existente.id;
    }

    const creado = await this.prisma.usuario.create({
      data: {
        telegramId: String(tgId),
        nombre: `Usuario Telegram ${tgId}`,
      },
    });

    return creado.id;
  }

  /**
   * Resuelve un usuario que debe existir. Se usa en lecturas y mutaciones
   * para no crear usuarios fantasma al consultar un `telegramId` desconocido.
   */
  async resolverUsuarioId(
    usuarioIdentifier: number | string,
  ): Promise<number> {
    if (typeof usuarioIdentifier === 'number') {
      return usuarioIdentifier;
    }

    const usuario = await this.prisma.usuario.findFirst({
      where: { telegramId: String(usuarioIdentifier) },
    });

    if (!usuario) {
      throw noEncontrado(`Usuario con telegramId ${usuarioIdentifier} no encontrado`);
    }

    return usuario.id;
  }

  /**
   * Resuelve un usuario sin crearlo ni lanzar excepción.
   * Devuelve `null` cuando el `telegramId` no está registrado.
   */
  async buscarUsuarioId(
    usuarioIdentifier: number | string,
  ): Promise<number | null> {
    if (typeof usuarioIdentifier === 'number') {
      return usuarioIdentifier;
    }

    const usuario = await this.prisma.usuario.findFirst({
      where: { telegramId: String(usuarioIdentifier) },
    });

    return usuario ? usuario.id : null;
  }
}
