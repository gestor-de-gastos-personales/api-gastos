import { estaEnLista, esRequerido, esOpcional, esTexto } from '../../common/validadores.js';
import * as validacion from '../../common/validacion.js';
import * as tipos from '../gastos.types.js';

export class CreateGastoRecurrenteDto {
  @esRequerido()
  @validacion.entero()
  usuarioId!: number;

  @esOpcional()
  @esTexto()
  telegramId?: string;

  @esRequerido()
  @validacion.decimal()
  monto!: number;

  @esOpcional()
  @esTexto()
  comercio?: string;

  @esOpcional()
  @validacion.entero()
  categoriaId?: number;

  @esOpcional()
  @esTexto()
  categoria?: string;

  @esRequerido()
  @esTexto()
  descripcion!: string;

  @esRequerido()
  @estaEnLista(tipos.FRECUENCIAS)
  frecuencia!: tipos.Frecuencia;

  @esOpcional()
  @validacion.entero()
  @validacion.rango(0, 6)
  diaSemana?: number;

  @esOpcional()
  @validacion.entero()
  @validacion.rango(1, 31)
  diaMes?: number;

  @esOpcional()
  @validacion.booleano()
  activo?: boolean;
}
