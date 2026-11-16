import * as nj from '../../common/nest.js';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard de JWT "opcional".
 *
 * Intenta autenticar con el token Bearer cuando está presente, pero no
 * rechaza la petición si no hay token. Se usa en los endpoints que
 * comparten el bot de Telegram (que identifica al usuario con
 * `telegramId`) y la web (que usa JWT).
 */
@nj.injectable()
export class JwtOpcionalGuard extends AuthGuard('jwt') {
  handleRequest<TUsuario>(_err: unknown, usuario: TUsuario): TUsuario | undefined {
    return usuario ?? undefined;
  }
}
