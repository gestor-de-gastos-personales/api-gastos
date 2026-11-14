import * as nest from '@nestjs/common';
import { GruposService } from './grupos.service.js';
import * as DTO from './dto/index.js';

@nest.Controller('grupos')
export class GruposController {
  constructor(private readonly gruposService: GruposService) {}

  @nest.Get()
  listar(@nest.Query('telegramId') telegramId?: string) {
    return this.gruposService.listar(telegramId ?? '');
  }

  @nest.Post()
  crear(@nest.Body() dto: DTO.CreateGrupoDto) {
    return this.gruposService.crear(dto);
  }

  @nest.Post('unirse')
  unirse(@nest.Body() dto: DTO.UnirseGrupoDto) {
    return this.gruposService.unirse(dto);
  }
}
