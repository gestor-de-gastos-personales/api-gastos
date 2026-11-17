import { esRequerido, esTexto } from '../../common/validadores.js';


/** Ingreso a un grupo existente mediante su código de invitación. */
export class UnirseGrupoDto {
  @esTexto()
  @esRequerido({ message: 'El telegramId es obligatorio' })
  telegramId: string;

  @esTexto()
  @esRequerido({ message: 'El código de invitación es obligatorio' })
  codigoInvitacion: string;
}
