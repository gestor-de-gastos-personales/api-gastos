import { IsNotEmpty, IsString } from 'class-validator';

/** Alta de un grupo compartido (F10). */
export class CreateGrupoDto {
  @IsString()
  @IsNotEmpty({ message: 'El telegramId es obligatorio' })
  telegramId: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre del grupo es obligatorio' })
  nombre: string;
}
