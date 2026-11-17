import { esRequerido, esTexto } from '../../common/validadores.js';


export class CreateCategoriaDto {
  @esTexto()
  @esRequerido()
  nombre: string;
}
