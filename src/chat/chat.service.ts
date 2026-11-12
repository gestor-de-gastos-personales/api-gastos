import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  RequestTimeoutException,
} from '@nestjs/common';
import type { ArchivoSubido } from './chat.types.js';

/** Cliente interno del servicio de IA para el asistente web. */
@Injectable()
export class ChatService {
  private urlBase(): string {
    return (
      process.env.SERVICIO_IA_URL || 'http://127.0.0.1:3002'
    ).replace(/\/+$/, '');
  }

  /** Analiza un mensaje de texto y devuelve la intención + campos. */
  async analizarTexto(texto: string): Promise<unknown> {
    return this.pedir('/analizar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texto }),
    });
  }

  /** Envía una imagen al servicio de visión y devuelve el gasto detectado. */
  async analizarImagen(archivo: ArchivoSubido): Promise<unknown> {
    if (!archivo) {
      throw new BadRequestException('Falta la imagen del comprobante.');
    }
    if (!archivo.mimetype.startsWith('image/')) {
      throw new BadRequestException('El archivo debe ser una imagen.');
    }

    const formulario = new FormData();
    formulario.append(
      'file',
      new Blob([archivo.buffer as unknown as BlobPart], {
        type: archivo.mimetype,
      }),
      archivo.originalname || 'comprobante',
    );

    return this.pedir('/analizar-imagen', {
      method: 'POST',
      body: formulario,
    });
  }

  private async pedir(ruta: string, init: RequestInit): Promise<unknown> {
    let respuesta: Response;

    try {
      respuesta = await fetch(`${this.urlBase()}${ruta}`, {
        ...init,
        signal: AbortSignal.timeout(60_000),
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'TimeoutError') {
        throw new RequestTimeoutException(
          'El asistente tardó demasiado. Probá de nuevo.',
        );
      }
      throw new BadGatewayException(
        'No se pudo conectar con el servicio de IA.',
      );
    }

    if (!respuesta.ok) {
      const detalle = await respuesta.text().catch(() => '');
      throw new BadGatewayException(
        detalle || 'El servicio de IA rechazó la solicitud.',
      );
    }

    return respuesta.json();
  }
}
