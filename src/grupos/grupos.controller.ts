import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { GruposService } from './grupos.service.js';
import { CreateGrupoDto } from './dto/create-grupo.dto.js';
import { UnirseGrupoDto } from './dto/unirse-grupo.dto.js';

@Controller('grupos')
export class GruposController {
  constructor(private readonly gruposService: GruposService) {}

  @Get()
  listar(@Query('telegramId') telegramId?: string) {
    return this.gruposService.listar(telegramId ?? '');
  }

  @Post()
  crear(@Body() dto: CreateGrupoDto) {
    return this.gruposService.crear(dto);
  }

  @Post('unirse')
  unirse(@Body() dto: UnirseGrupoDto) {
    return this.gruposService.unirse(dto);
  }
}
