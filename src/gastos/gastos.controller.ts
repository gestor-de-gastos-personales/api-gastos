import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { GastosService } from './gastos.service.js';
import { CreateGastoDto } from './dto/create-gasto.dto.js';
import { UpdateGastoDto } from './dto/update-gasto.dto.js';
import { FilterGastosDto } from './dto/filter-gasto.dto.js';
import { FilterResumenDto } from './dto/filter-resumen.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { GetUser } from '../auth/decorators/get-user.decorator.js';

@Controller('gastos')
export class GastosController {
  constructor(private readonly gastosService: GastosService) {}

  // 🤖 Endpoint libre para el Bot de Telegram
  @Post('bot')
  createFromBot(@Body() body: any) {
    return this.gastosService.create(body.usuarioId || body.telegramId, body);
  }

  // 🤖 Endpoint de resumen para el Bot de Telegram
  @Get('resumen/bot')
  getResumenBot(@Query('telegramId') telegramId: string) {
    return this.gastosService.getResumen(telegramId as any, {});
  }

  // 🔒 Endpoints protegidos con JWT para Frontend/App
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@GetUser('id') usuarioId: number, @Body() createGastoDto: CreateGastoDto) {
    return this.gastosService.create(usuarioId, createGastoDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@GetUser('id') usuarioId: number, @Query() filterDto: FilterGastosDto) {
    return this.gastosService.findAll(usuarioId, filterDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('resumen')
  getResumen(@GetUser('id') usuarioId: number, @Query() filterDto: FilterResumenDto) {
    return this.gastosService.getResumen(usuarioId, filterDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@GetUser('id') usuarioId: number, @Param('id', ParseIntPipe) id: number) {
    return this.gastosService.findOne(usuarioId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @GetUser('id') usuarioId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGastoDto: UpdateGastoDto,
  ) {
    return this.gastosService.update(usuarioId, id, updateGastoDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@GetUser('id') usuarioId: number, @Param('id', ParseIntPipe) id: number) {
    return this.gastosService.remove(usuarioId, id);
  }
}