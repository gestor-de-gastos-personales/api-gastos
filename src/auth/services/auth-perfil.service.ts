import * as nest from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

/** Perfil del usuario autenticado, sin contraseña. */
@nest.Injectable()
export class AuthPerfilService {
  constructor(private readonly prisma: PrismaService) {}

  async perfil(usuarioId: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
    });

    if (!usuario) {
      throw new nest.UnauthorizedException('Usuario no encontrado');
    }

    const { password: _password, ...result } = usuario;
    return result;
  }
}
