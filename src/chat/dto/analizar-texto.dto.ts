import { esRequerido, esTexto } from '../../common/validadores.js';
import { MaxLength } from 'class-validator';

export class AnalizarTextoDto {
  @esTexto()
  @esRequerido()
  @MaxLength(2000)
  texto!: string;
}
