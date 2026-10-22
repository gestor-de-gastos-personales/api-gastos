import { IsNotEmpty, IsString } from 'class-validator';
import { CredencialesDto } from './credenciales.dto.js';

export class RegisterDto extends CredencialesDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  nombre: string;
}
