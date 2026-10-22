import { Controller, Patch, Delete, Body, Param } from '@nestjs/common';
import { CategoriasService } from '../services/categorias.service.js';
import { UpdateCategoriaDto } from '../dto/update-categoria.dto.js';

/**
 * Mutaciones de categorías: se separan de la consulta y el alta
 * para mantener controladores pequeños y enfocados.
 */
@Controller('categorias')
export class CategoriasEdicionController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoriaDto: UpdateCategoriaDto,
  ) {
    return this.categoriasService.update(+id, updateCategoriaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriasService.remove(+id);
  }
}
