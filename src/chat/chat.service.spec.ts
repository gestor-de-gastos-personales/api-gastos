import { BadGatewayException, BadRequestException } from '@nestjs/common';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ChatService } from './chat.service.js';

const ARCHIVO = {
  buffer: Buffer.from('imagen'),
  mimetype: 'image/png',
  originalname: 'ticket.png',
};

describe('ChatService', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    process.env.SERVICIO_IA_URL = 'http://ia.test';
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.SERVICIO_IA_URL;
  });

  it('analiza texto contra servicio-ia', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ intent: 'CREATE_EXPENSE', monto: 100 }),
    });

    await expect(new ChatService().analizarTexto('gasté 100')).resolves.toEqual({
      intent: 'CREATE_EXPENSE',
      monto: 100,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://ia.test/analizar',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ texto: 'gasté 100' }),
      }),
    );
  });

  it('analiza una imagen como multipart', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ intent: 'CREATE_EXPENSE', monto: 2500 }),
    });

    await expect(new ChatService().analizarImagen(ARCHIVO)).resolves.toEqual({
      intent: 'CREATE_EXPENSE',
      monto: 2500,
    });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe('POST');
    expect(init.body).toBeInstanceOf(FormData);
    expect((init.body as FormData).get('file')).toBeInstanceOf(Blob);
  });

  it('rechaza archivos faltantes o que no son imagen', async () => {
    const servicio = new ChatService();

    await expect(
      servicio.analizarImagen(undefined as never),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      servicio.analizarImagen({ ...ARCHIVO, mimetype: 'application/pdf' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('traduce errores de red y respuestas no exitosas', async () => {
    const servicio = new ChatService();

    fetchMock.mockRejectedValueOnce(new Error('sin red'));
    await expect(servicio.analizarTexto('hola')).rejects.toBeInstanceOf(
      BadGatewayException,
    );

    fetchMock.mockResolvedValueOnce({
      ok: false,
      text: async () => 'modelo no disponible',
    });
    await expect(servicio.analizarTexto('hola')).rejects.toBeInstanceOf(
      BadGatewayException,
    );
  });
});
