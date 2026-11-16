import * as nj from '../../common/nest.js';
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

  throw new nj.noAutorizado(
    'Se requiere autenticación o el parámetro telegramId',
  );
}

/**
 * Detalle, edición y baja de un gasto individual.
 *
 * Se registra al final del módulo para que las rutas literales
 * (`/gastos/ultimos`, `/gastos/resumen`, …) tengan prioridad sobre `:id`.
 */
@nj.controller('gastos')
@nj.useGuards(JwtOpcionalGuard)
export class GastosDetalleController {
  constructor(private readonly gastosService: GastosService) {}

  @nj.get(':id')
  findOne(
    @nj.req() solicitud: SolicitudConUsuario,
    @nj.param('id') id: string,
    @nj.query('telegramId') telegramId?: string,
  ) {
    return this.gastosService.getGastoById(
      resolverIdentidad(solicitud, telegramId),
      Number(id),
    );
  }

  @nj.patch(':id')
  update(
    @nj.req() solicitud: SolicitudConUsuario,
    @nj.param('id') id: string,
    @nj.body() dto: DTO.UpdateGastoDto,
    @nj.query('telegramId') telegramId?: string,
  ) {
    return this.gastosService.update(
      resolverIdentidad(solicitud, telegramId),
      Number(id),
      dto,
    );
  }

  @nj.del(':id')
  remove(
    @nj.req() solicitud: SolicitudConUsuario,
    @nj.param('id') id: string,
    @nj.query('telegramId') telegramId?: string,
  ) {
    return this.gastosService.remove(
      resolverIdentidad(solicitud, telegramId),
      Number(id),
    );
  }
}
