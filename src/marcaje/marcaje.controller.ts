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
import { timeInterval } from 'rxjs';
import { PeriodDto } from './dto/get-marcaje-dates';
import { MarcajeType } from './enum/marcaje-type.enum';

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

  @Get('/admin')
  async findAll() {
    return this.marcajeService.findAll();
  }

  @Delete('/admin')
  async deleteAll() {
    return this.marcajeService.removeAll();
  }

  @Get('/date')
  findByDate(@Body() dateInterval: PeriodDto) {
    return this.marcajeService.getByPeriod(dateInterval);
  }

  @Get('/user/:id')
  findFromUser(@Param('id') id: number) {
    return this.marcajeService.findAllFromUser(+id);
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
