import { Controller, Get, Patch, Delete, Body } from '@nestjs/common';
import { GastosService } from '../services/gastos.service.js';
import { UpdateGastoDto } from '../dto/update-gasto.dto.js';
import { Autenticado } from '../../auth/decorators/autenticado.decorator.js';
import { SolicitudGastoActual } from '../decorators/solicitud-gasto.decorator.js';

@Controller('gastos')
@Autenticado()
export class GastosEdicionController {
  constructor(private readonly gastosService: GastosService) {}

  @Get(':id')
  findOne(@SolicitudGastoActual() solicitud: { usuarioId: number; id: number }) {
    return this.gastosService.findOne(solicitud.usuarioId, solicitud.id);
  }

  @Patch(':id')
  update(
    @SolicitudGastoActual() solicitud: { usuarioId: number; id: number },
    @Body() updateGastoDto: UpdateGastoDto,
  ) {
    return this.gastosService.update(
      solicitud.usuarioId,
      solicitud.id,
      updateGastoDto,
    );
  }

  @Delete(':id')
  remove(@SolicitudGastoActual() solicitud: { usuarioId: number; id: number }) {
    return this.gastosService.remove(solicitud.usuarioId, solicitud.id);
  }
}
