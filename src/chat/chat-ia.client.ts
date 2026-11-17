import * as nj from '../common/nest.js';
import type { ArchivoSubido } from './chat.types.js';

const urlBase = () =>
  (process.env.SERVICIO_IA_URL || 'http://127.0.0.1:3002').replace(/\/+$/, '');

async function pedir(ruta: string, init: RequestInit): Promise<unknown> {
  let respuesta: Response;

  try {
    respuesta = await fetch(`${urlBase()}${ruta}`, {
      ...init,
      signal: AbortSignal.timeout(60_000),
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      throw new nj.tiempoAgotado(
        'El asistente tardó demasiado. Probá de nuevo.',
      );
    }
    throw new nj.puertaDeEnlace(
      'No se pudo conectar con el servicio de IA.',
    );
  }

  if (!respuesta.ok) {
    const detalle = await respuesta.text().catch(() => '');
    throw new nj.puertaDeEnlace(
      detalle || 'El servicio de IA rechazó la solicitud.',
    );
  }

  return respuesta.json();
}

/** Analiza un mensaje de texto contra servicio-ia. */
export function pedirTexto(texto: string): Promise<unknown> {
  return pedir('/analizar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texto }),
  });
}

/** Envía una imagen al servicio de visión y devuelve el gasto detectado. */
export function pedirImagen(archivo: ArchivoSubido): Promise<unknown> {
  const formulario = new FormData();
  formulario.append(
    'file',
    new Blob([archivo.buffer as unknown as BlobPart], {
      type: archivo.mimetype,
    }),
    archivo.originalname || 'comprobante',
  );

  return pedir('/analizar-imagen', {
    method: 'POST',
    body: formulario,
  });
}
