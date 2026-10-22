import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class VincularTelegramDto {
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'El telegramId es requerido' })
  telegramId: string;
}
