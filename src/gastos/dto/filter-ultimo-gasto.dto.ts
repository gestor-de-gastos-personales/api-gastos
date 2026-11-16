import { esEntero, esOpcional, esTexto } from '../../common/validadores.js';
import { Type } from 'class-transformer';


export class FilterUltimoGastoDto {
  @esEntero()
  @Type(() => Number)
  usuarioId!: number;

  @esOpcional()
  @esTexto()
  telegramId?: string;

  @esOpcional()
  @esTexto()
  comercio?: string;

  @esOpcional()
  @esTexto()
  categoria?: string;

  @esOpcional()
  @esTexto()
  desde?: string;
}
