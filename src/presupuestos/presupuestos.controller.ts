import * as nest from '@nestjs/common';
import { PresupuestosService } from './presupuestos.service.js';
import * as DTO from './dto/index.js';
import { Autenticado } from '../auth/decorators/autenticado.decorator.js';
import { GetUser } from '../auth/decorators/get-user.decorator.js';

@nest.Controller('presupuestos')
export class PresupuestosController {
  constructor(private readonly presupuestosService: PresupuestosService) {}

  @nest.Get()
  listar(
    @nest.Query('telegramId') telegramId?: string,
    @nest.Query('mes') mes?: string,
    @nest.Query('anio') anio?: string,
  ) {
    return this.presupuestosService.listar(
      telegramId ?? '',
      mes !== undefined ? Number(mes) : undefined,
      anio !== undefined ? Number(anio) : undefined,
    );
  }

  @nest.Post()
  guardar(@nest.Body() dto: DTO.CreatePresupuestoDto) {
    return this.presupuestosService.guardar(dto);
  }

  /** Presupuestos del usuario autenticado (web). */
  @nest.Get('mios')
  @Autenticado()
  listarMios(
    @GetUser('id') usuarioId: number,
    @nest.Query('mes') mes?: string,
    @nest.Query('anio') anio?: string,
  ) {
    return this.presupuestosService.listarPorUsuario(
      usuarioId,
      mes !== undefined ? Number(mes) : undefined,
      anio !== undefined ? Number(anio) : undefined,
    );
  }

  @nest.Post('mios')
  @Autenticado()
  guardarMio(
    @GetUser('id') usuarioId: number,
    @nest.Body() dto: DTO.PresupuestoMioDto,
  ) {
    return this.presupuestosService.guardarParaUsuario(usuarioId, dto);
  }
}
