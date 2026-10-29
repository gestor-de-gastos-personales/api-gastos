import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { GastosService } from '../services/gastos.service.js';
import { UpdateGastoDto } from '../dto/update-gasto.dto.js';
import { JwtOpcionalGuard } from '../../auth/guards/jwt-opcional.guard.js';

interface SolicitudConUsuario {
  user?: { id: number };
}

/**
 * Resuelve la identidad del solicitante.
 *
 * Prioriza el usuario del JWT (la web) y cae a `telegramId` (el bot). Nunca
 * acepta un `usuarioId` arbitrario: el alcance siempre queda atado al usuario
 * autenticado o al telegramId indicado, así un usuario no puede operar sobre
 * los gastos de otro.
 */
function resolverIdentidad(
  solicitud: SolicitudConUsuario,
  telegramId?: string,
): number | string {
  if (solicitud.user?.id) return solicitud.user.id;
  if (telegramId) return telegramId;

  throw new UnauthorizedException(
    'Se requiere autenticación o el parámetro telegramId',
  );
}

/**
 * Detalle, edición y baja de un gasto individual.
 *
 * Se registra al final del módulo para que las rutas literales
 * (`/gastos/ultimos`, `/gastos/resumen`, …) tengan prioridad sobre `:id`.
 */
@Controller('gastos')
@UseGuards(JwtOpcionalGuard)
export class GastosDetalleController {
  constructor(private readonly gastosService: GastosService) {}

  @Get(':id')
  findOne(
    @Req() solicitud: SolicitudConUsuario,
    @Param('id') id: string,
    @Query('telegramId') telegramId?: string,
  ) {
    return this.gastosService.getGastoById(
      resolverIdentidad(solicitud, telegramId),
      Number(id),
    );
  }

  @Patch(':id')
  update(
    @Req() solicitud: SolicitudConUsuario,
    @Param('id') id: string,
    @Body() dto: UpdateGastoDto,
    @Query('telegramId') telegramId?: string,
  ) {
    return this.gastosService.update(
      resolverIdentidad(solicitud, telegramId),
      Number(id),
      dto,
    );
  }

  @Delete(':id')
  remove(
    @Req() solicitud: SolicitudConUsuario,
    @Param('id') id: string,
    @Query('telegramId') telegramId?: string,
  ) {
    return this.gastosService.remove(
      resolverIdentidad(solicitud, telegramId),
      Number(id),
    );
  }
}
