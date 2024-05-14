import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { MarcajeService } from './marcaje.service';
import { CreateMarcajeDto } from './dto/create-marcaje.dto';
import { UpdateMarcajeDto } from './dto/update-marcaje.dto';

@Controller('marcaje')
export class MarcajeController {
  constructor(private readonly marcajeService: MarcajeService) {}

  @Post()
  async create(@Body() marcajeDto: CreateMarcajeDto) {
    try {
      const response = await this.marcajeService.createMarcaje(marcajeDto);
      console.log("Respuesta: ", response);
      if (response?.success) {
        console.log(response.data);
        return response.data;
      } else {
        throw new HttpException(response.message, HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      throw new HttpException('Error interno del servidor', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  findAll() {
    return this.marcajeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.marcajeService.findFromUser(+id);
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
