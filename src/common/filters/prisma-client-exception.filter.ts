import * as nj from '../nest.js';
import { errorPrisma } from '../../prisma/tipos.js';
import { respuestas } from './respuestas-prisma.js';
import type { peticion, respuestaHttp } from '../express.js';

@nj.catchError(errorPrisma)
export class PrismaClientExceptionFilter extends nj.filtroBase {
  constructor(adapter: nj.tipoAdaptador) {
    super(adapter);
  }

  catch(exception: errorPrisma, host: nj.hostArgumentos) {
    const respuesta = respuestas[exception.code];

    if (!respuesta) {
      // Código no mapeado: delega al manejador por defecto de Nest.
      super.catch(exception, host);
      return;
    }

    const ctx = host.switchToHttp();
    const target =
      (exception.meta?.target as string[] | undefined)?.join(', ') ??
      'campo duplicado';

    this.responder(
      ctx.getResponse<respuestaHttp>(),
      ctx.getRequest<peticion>(),
      respuesta,
      target,
    );
  }

  private responder(
    response: respuestaHttp,
    request: peticion,
    respuesta: { status: number; mensaje: (target: string) => string },
    target: string,
  ) {
    response.status(respuesta.status).json({
      statusCode: respuesta.status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: respuesta.mensaje(target),
    });
  }
}
