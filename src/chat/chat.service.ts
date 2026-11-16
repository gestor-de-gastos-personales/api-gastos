import * as nj from '../common/nest.js';
import type { ArchivoSubido } from './chat.types.js';
import { pedirImagen, pedirTexto } from './chat-ia.client.js';

/** Cliente interno del servicio de IA para el asistente web. */
@nj.injectable()
export class ChatService {
  /** Analiza un mensaje de texto y devuelve la intención + campos. */
  async analizarTexto(texto: string): Promise<unknown> {
    return pedirTexto(texto);
  }

  /** Envía una imagen al servicio de visión y devuelve el gasto detectado. */
  async analizarImagen(archivo: ArchivoSubido): Promise<unknown> {
    if (!archivo) {
      throw new nj.solicitudInvalida('falta la imagen del comprobante.');
    }
    if (!archivo.mimetype.startsWith('image/')) {
      throw new nj.solicitudInvalida('el archivo debe ser una imagen.');
    }

    return pedirImagen(archivo);
  }
}
