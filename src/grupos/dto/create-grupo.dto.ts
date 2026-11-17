import { esRequerido, esTexto } from '../../common/validadores.js';


/** Alta de un grupo compartido (F10). */
export class CreateGrupoDto {
  @esTexto()
  @esRequerido({ message: 'El telegramId es obligatorio' })
  telegramId: string;

  @esTexto()
  @esRequerido({ message: 'El nombre del grupo es obligatorio' })
  nombre: string;
}
