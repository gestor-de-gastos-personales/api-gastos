import { describe, expect, it, vi } from 'vitest';
import { ChatController } from './chat.controller.js';
import type { ChatService } from './chat.service.js';

describe('ChatController', () => {
  it('delega el texto y la imagen al servicio', async () => {
    const chatService = {
      analizarTexto: vi.fn().mockResolvedValue({ intent: 'CREATE_EXPENSE' }),
      analizarImagen: vi.fn().mockResolvedValue({ intent: 'CREATE_EXPENSE' }),
    } as unknown as ChatService;
    const controller = new ChatController(chatService);
    const archivo = {
      buffer: Buffer.from('x'),
      mimetype: 'image/png',
      originalname: 'ticket.png',
    };

    await expect(controller.analizar({ texto: 'gasté 100' })).resolves.toEqual({
      intent: 'CREATE_EXPENSE',
    });
    await expect(controller.analizarImagen(archivo)).resolves.toEqual({
      intent: 'CREATE_EXPENSE',
    });

    expect(chatService.analizarTexto).toHaveBeenCalledWith('gasté 100');
    expect(chatService.analizarImagen).toHaveBeenCalledWith(archivo);
  });
});
