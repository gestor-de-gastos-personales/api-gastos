import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateGastoRecurrenteDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  usuarioId!: number;

  @IsOptional()
  @IsString()
  telegramId?: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  monto!: number;

  @IsOptional()
  @IsString()
  comercio?: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  categoriaId!: number;

  @IsOptional()
  @IsString()
  categoria?: string;

  @IsNotEmpty()
  @IsString()
  descripcion!: string;

  @IsNotEmpty()
  @IsIn(['DIARIA', 'SEMANAL', 'MENSUAL', 'ANUAL'])
  frecuencia!: 'DIARIA' | 'SEMANAL' | 'MENSUAL' | 'ANUAL';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(6)
  diaSemana?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(31)
  diaMes?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  activo?: boolean;
}
