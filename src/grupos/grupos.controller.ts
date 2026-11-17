import * as nj from '../common/nest.js';
import { GruposService } from './grupos.service.js';
import * as DTO from './dto/index.js';

@nj.controller('grupos')
export class GruposController {
  constructor(private readonly gruposService: GruposService) {}

  @nj.get()
  listar(@nj.query('telegramId') telegramId?: string) {
    return this.gruposService.listar(telegramId ?? '');
  }

  @nj.post()
  crear(@nj.body() dto: DTO.CreateGrupoDto) {
    return this.gruposService.crear(dto);
  }

  @nj.post('unirse')
  unirse(@nj.body() dto: DTO.UnirseGrupoDto) {
    return this.gruposService.unirse(dto);
  }
}
