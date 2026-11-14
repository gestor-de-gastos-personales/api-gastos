import * as nest from '@nestjs/common';
import { GastosService } from '../services/gastos.service.js';
import * as DTO from '../dto/index.js';
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

  throw new nest.UnauthorizedException(
    'Se requiere autenticación o el parámetro telegramId',
  );
}

/**
 * Detalle, edición y baja de un gasto individual.
 *
 * Se registra al final del módulo para que las rutas literales
 * (`/gastos/ultimos`, `/gastos/resumen`, …) tengan prioridad sobre `:id`.
 */
@nest.Controller('gastos')
@nest.UseGuards(JwtOpcionalGuard)
export class GastosDetalleController {
  constructor(private readonly gastosService: GastosService) {}

  @nest.Get(':id')
  findOne(
    @nest.Req() solicitud: SolicitudConUsuario,
    @nest.Param('id') id: string,
    @nest.Query('telegramId') telegramId?: string,
  ) {
    return this.gastosService.getGastoById(
      resolverIdentidad(solicitud, telegramId),
      Number(id),
    );
  }

  @nest.Patch(':id')
  update(
    @nest.Req() solicitud: SolicitudConUsuario,
    @nest.Param('id') id: string,
    @nest.Body() dto: DTO.UpdateGastoDto,
    @nest.Query('telegramId') telegramId?: string,
  ) {
    return this.gastosService.update(
      resolverIdentidad(solicitud, telegramId),
      Number(id),
      dto,
    );
  }

  @nest.Delete(':id')
  remove(
    @nest.Req() solicitud: SolicitudConUsuario,
    @nest.Param('id') id: string,
    @nest.Query('telegramId') telegramId?: string,
  ) {
    return this.gastosService.remove(
      resolverIdentidad(solicitud, telegramId),
      Number(id),
    );
  }
}
