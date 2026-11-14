import * as nest from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Autenticado } from '../auth/decorators/autenticado.decorator.js';
import { ChatService } from './chat.service.js';
import type { ArchivoSubido } from './chat.types.js';
import { AnalizarTextoDto } from './dto/analizar-texto.dto.js';

@nest.Controller('chat')
@Autenticado()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @nest.Post('analizar')
  analizar(@nest.Body() dto: AnalizarTextoDto) {
    return this.chatService.analizarTexto(dto.texto);
  }

  @nest.Post('analizar-imagen')
  @nest.UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }),
  )
  analizarImagen(@nest.UploadedFile() archivo: ArchivoSubido) {
    return this.chatService.analizarImagen(archivo);
  }
}
