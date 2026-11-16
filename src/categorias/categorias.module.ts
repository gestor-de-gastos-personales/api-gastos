import * as nj from '../common/nest.js';
import { CategoriasService } from './services/categorias.service.js';
import { CategoriasController } from './controllers/categorias.controller.js';
import { CategoriasEdicionController } from './controllers/categorias-edicion.controller.js';

@nj.modulo({
  controllers: [CategoriasController, CategoriasEdicionController],
  providers: [CategoriasService],
})
export class CategoriasModule {}
