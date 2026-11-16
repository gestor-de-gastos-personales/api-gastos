import * as nj from '../../common/nest.js';
import { CategoriasService } from '../services/categorias.service.js';
import { CreateCategoriaDto } from '../dto/create-categoria.dto.js';

@nj.controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @nj.get()
  findAll() {
    return this.categoriasService.findAll();
  }

  @nj.get(':id')
  findOne(@nj.param('id') id: string) {
    return this.categoriasService.findOne(+id);
  }

  @nj.post()
  create(@nj.body() createCategoriaDto: CreateCategoriaDto) {
    return this.categoriasService.create(createCategoriaDto);
  }
}
