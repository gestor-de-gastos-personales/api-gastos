import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard de JWT "opcional".
 *
 * Intenta autenticar con el token Bearer cuando está presente, pero no
 * rechaza la petición si no hay token. Se usa en los endpoints que
 * comparten el bot de Telegram (que identifica al usuario con
 * `telegramId`) y la web (que usa JWT).
 */
@Injectable()
export class JwtOpcionalGuard extends AuthGuard('jwt') {
  handleRequest<TUsuario>(_err: unknown, usuario: TUsuario): TUsuario | undefined {
    return usuario ?? undefined;
  }
}
