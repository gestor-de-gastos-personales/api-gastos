import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateCategoriaDto } from '../dto/create-categoria.dto.js';
import { UpdateCategoriaDto } from '../dto/update-categoria.dto.js';
import { PrismaService } from '../../prisma/prisma.service.js';

type Categoria = { id: number; nombre: string; default: boolean };

@Injectable()
export class CategoriasService {
  constructor(private readonly prisma: PrismaService) {}

  private noEncontrada(id: number) {
    return new NotFoundException(`Categoría con ID #${id} no encontrada`);
  }

  /** Las categorías del sistema no pueden editarse ni eliminarse. */
  private asegurarEditable(categoria: Categoria) {
    if (categoria.default) {
      throw new ForbiddenException(
        'No se pueden modificar las categorías por defecto del sistema',
      );
    }
  }

  async create(createCategoriaDto: CreateCategoriaDto) {
    return this.prisma.categoria.create({
      data: {
        nombre: createCategoriaDto.nombre,
      },
    });
  }

  async findAll() {
    return await this.prisma.categoria.findMany();
  }

  async findOne(id: number) {
    const categoria = await this.prisma.categoria.findUnique({
      where: { id },
    });

    if (!categoria) {
      throw this.noEncontrada(id);
    }

    return categoria;
  }

  async update(id: number, updateCategoriaDto: UpdateCategoriaDto) {
    const categoria = await this.findOne(id);
    this.asegurarEditable(categoria);

    return await this.prisma.categoria.update({
      where: { id },
      data: updateCategoriaDto,
    });
  }

  async remove(id: number) {
    const categoria = await this.findOne(id);
    this.asegurarEditable(categoria);

    return await this.prisma.categoria.delete({
      where: { id },
    });
  }
}
