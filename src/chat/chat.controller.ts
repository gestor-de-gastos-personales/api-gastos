import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Autenticado } from '../auth/decorators/autenticado.decorator.js';
import { ChatService } from './chat.service.js';
import type { ArchivoSubido } from './chat.types.js';
import { AnalizarTextoDto } from './dto/analizar-texto.dto.js';

@Controller('chat')
@Autenticado()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('analizar')
  analizar(@Body() dto: AnalizarTextoDto) {
    return this.chatService.analizarTexto(dto.texto);
  }

  @Post('analizar-imagen')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }),
  )
  analizarImagen(@UploadedFile() archivo: ArchivoSubido) {
    return this.chatService.analizarImagen(archivo);
  }
}
