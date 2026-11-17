import { autenticado } from '../auth/decoradores.js';
import * as nj from '../common/nest.js';
import { FileInterceptor } from '@nestjs/platform-express';
import { ChatService } from './chat.service.js';
import type { ArchivoSubido } from './chat.types.js';
import { AnalizarTextoDto } from './dto/analizar-texto.dto.js';

@nj.controller('chat')
@autenticado()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @nj.post('analizar')
  analizar(@nj.body() dto: AnalizarTextoDto) {
    return this.chatService.analizarTexto(dto.texto);
  }

  @nj.post('analizar-imagen')
  @nj.useInterceptors(
    FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }),
  )
  analizarImagen(@nj.uploadedFile() archivo: ArchivoSubido) {
    return this.chatService.analizarImagen(archivo);
  }
}
