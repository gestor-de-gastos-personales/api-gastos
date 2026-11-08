import { IsNotEmpty, IsString } from 'class-validator';

/** Ingreso a un grupo existente mediante su código de invitación. */
export class UnirseGrupoDto {
  @IsString()
  @IsNotEmpty({ message: 'El telegramId es obligatorio' })
  telegramId: string;

  @IsString()
  @IsNotEmpty({ message: 'El código de invitación es obligatorio' })
  codigoInvitacion: string;
}
