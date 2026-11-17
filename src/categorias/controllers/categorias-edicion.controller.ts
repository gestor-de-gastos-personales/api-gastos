import * as nj from '../../common/nest.js';
import { CategoriasService } from '../services/categorias.service.js';
import { UpdateCategoriaDto } from '../dto/update-categoria.dto.js';

/**
 * Mutaciones de categorías: se separan de la consulta y el alta
 * para mantener controladores pequeños y enfocados.
 */
@nj.controller('categorias')
export class CategoriasEdicionController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @nj.patch(':id')
  update(
    @nj.param('id') id: string,
    @nj.body() updateCategoriaDto: UpdateCategoriaDto,
  ) {
    return this.categoriasService.update(+id, updateCategoriaDto);
  }

  @nj.del(':id')
  remove(@nj.param('id') id: string) {
    return this.categoriasService.remove(+id);
  }
}
