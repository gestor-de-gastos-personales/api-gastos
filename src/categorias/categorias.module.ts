import { Module } from '@nestjs/common';
import { CategoriasService } from './services/categorias.service.js';
import { CategoriasController } from './controllers/categorias.controller.js';
import { CategoriasEdicionController } from './controllers/categorias-edicion.controller.js';

@Module({
  controllers: [CategoriasController, CategoriasEdicionController],
  providers: [CategoriasService],
})
export class CategoriasModule {}
