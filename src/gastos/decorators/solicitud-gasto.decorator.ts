import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface SolicitudGasto {
  usuarioId: number;
  id: number;
}

/**
 * Extrae en un solo objeto el usuario autenticado y el id de la ruta,
 * evitando repetir dos decoradores en cada endpoint de edición.
 */
export const SolicitudGastoActual = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): SolicitudGasto => {
    const request = ctx.switchToHttp().getRequest();
    return {
      usuarioId: request.user.id,
      id: Number(request.params.id),
    };
  },
);
