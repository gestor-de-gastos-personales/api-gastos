import { esRequerido, esTexto } from '../../common/validadores.js';
import { IsEmail, MinLength } from 'class-validator';

/**
 * Credenciales compartidas por los flujos web y de Telegram.
 * Evita repetir las mismas reglas de validación en cada DTO.
 */
export class CredencialesDto {
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  email: string;

  @esTexto()
  @esRequerido({ message: 'La contraseña es requerida' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;
}
