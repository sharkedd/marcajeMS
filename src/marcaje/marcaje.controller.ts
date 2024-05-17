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
  async create(@Body() createMarcaje: CreateMarcajeDto) {

      console.log("Controller")
      const response = await this.marcajeService.createMarcaje(createMarcaje.token);
      console.log("Respuesta: ", response);
      
      if (response?.success) {
        console.log(response.data);
        return response.data;
      } else {
        throw new HttpException(response.message, HttpStatus.BAD_REQUEST);
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
