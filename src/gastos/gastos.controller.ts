import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { GastosService } from './gastos.service.js';
import { CreateGastoDto } from './dto/create-gasto.dto.js';
import { UpdateGastoDto } from './dto/update-gasto.dto.js';
import { FilterGastosDto } from './dto/filter-gasto.dto.js';
import { FilterResumenDto } from './dto/filter-resumen.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { GetUser } from '../auth/decorators/get-user.decorator.js';

@UseGuards(JwtAuthGuard)
@Controller('gastos')
export class GastosController {
  constructor(private readonly gastosService: GastosService) {}

  @Post()
  create(@GetUser('id') usuarioId: number, @Body() createGastoDto: CreateGastoDto) {
    return this.gastosService.create(usuarioId, createGastoDto);
  }

  @Get()
  findAll(@GetUser('id') usuarioId: number, @Query() filterDto: FilterGastosDto) {
    return this.gastosService.findAll(usuarioId, filterDto);
  }

  @Get('resumen')
  getResumen(@GetUser('id') usuarioId: number, @Query() filterDto: FilterResumenDto) {
    return this.gastosService.getResumen(usuarioId, filterDto);
  }

  @Get(':id')
  findOne(@GetUser('id') usuarioId: number, @Param('id', ParseIntPipe) id: number) {
    return this.gastosService.findOne(usuarioId, id);
  }

  @Patch(':id')
  update(
    @GetUser('id') usuarioId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGastoDto: UpdateGastoDto,
  ) {
    return this.gastosService.update(usuarioId, id, updateGastoDto);
  }

  @Delete(':id')
  remove(@GetUser('id') usuarioId: number, @Param('id', ParseIntPipe) id: number) {
    return this.gastosService.remove(usuarioId, id);
  }
}