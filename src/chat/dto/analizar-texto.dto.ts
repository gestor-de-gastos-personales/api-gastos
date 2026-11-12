import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AnalizarTextoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  texto!: string;
}
