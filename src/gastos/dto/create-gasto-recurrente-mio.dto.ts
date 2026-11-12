import { OmitType } from '@nestjs/mapped-types';
import { CreateGastoRecurrenteDto } from './create-gasto-recurrente.dto.js';

/** Alta de recurrente desde la web: el usuario sale del JWT. */
export class CreateGastoRecurrenteMioDto extends OmitType(
  CreateGastoRecurrenteDto,
  ['usuarioId', 'telegramId'] as const,
) {}
