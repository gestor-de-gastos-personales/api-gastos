import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UpdateGastoRecurrenteDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  monto?: number;

  @IsOptional()
  @IsString()
  comercio?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoriaId?: number;

  @IsOptional()
  @IsString()
  categoria?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsIn(['DIARIA', 'SEMANAL', 'MENSUAL', 'ANUAL'])
  frecuencia?: 'DIARIA' | 'SEMANAL' | 'MENSUAL' | 'ANUAL';

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
