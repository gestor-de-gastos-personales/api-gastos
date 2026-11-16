import { esFechaISO, esNumero, esOpcional, esRequerido, esTexto } from '../../common/validadores.js';


export class CreateGastoDto {
  @esTexto()
  @esRequerido()
  descripcion: string;

  @esNumero()
  @esRequerido()
  valor: number;

  @esOpcional()
  @esFechaISO()
  fecha?: string;

  @esNumero()
  @esRequerido()
  categoria: number;
}