import { ArgumentsHost, Catch } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import type { Response, Request } from 'express';

interface RespuestaError {
  status: number;
  mensaje: (target: string) => string;
}

/** Mapa de códigos de Prisma a respuestas HTTP legibles. */
const RESPUESTAS: Record<string, RespuestaError> = {
  P2002: {
    status: 409,
    mensaje: (target) =>
      `Violación de restricción única en: [${target}]`,
  },
  P2025: {
    status: 404,
    mensaje: () =>
      'El registro solicitado no fue encontrado en la base de datos.',
  },
  P2003: {
    status: 400,
    mensaje: () =>
      'Operación no permitida: referencia a un registro inexistente (Clave foránea inválida).',
  },
};

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const respuesta = RESPUESTAS[exception.code];

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
      ctx.getResponse<Response>(),
      ctx.getRequest<Request>(),
      respuesta,
      target,
    );
  }

  private responder(
    response: Response,
    request: Request,
    respuesta: RespuestaError,
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
