import { esRequerido, esTexto } from '../../common/validadores.js';

import { CredencialesDto } from './credenciales.dto.js';

export class RegisterDto extends CredencialesDto {
  @esTexto()
  @esRequerido({ message: 'El nombre no puede estar vacío' })
  nombre: string;
}
