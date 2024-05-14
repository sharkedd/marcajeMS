import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MarcajeService } from './marcaje.service';
import { CreateMarcajeDto } from './dto/create-marcaje.dto';
import { UpdateMarcajeDto } from './dto/update-marcaje.dto';

@Controller('marcaje')
export class MarcajeController {
  constructor(private readonly marcajeService: MarcajeService) {}

  @Post()
  create(@Body() createMarcajeDto: CreateMarcajeDto) {
    return this.marcajeService.create(createMarcajeDto);
  }

  @Get()
  findAll() {
    return this.marcajeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.marcajeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMarcajeDto: UpdateMarcajeDto) {
    return this.marcajeService.update(+id, updateMarcajeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.marcajeService.remove(+id);
  }
}
