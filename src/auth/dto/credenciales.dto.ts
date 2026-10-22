import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

/**
 * Credenciales compartidas por los flujos web y de Telegram.
 * Evita repetir las mismas reglas de validación en cada DTO.
 */
export class CredencialesDto {
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;
}
