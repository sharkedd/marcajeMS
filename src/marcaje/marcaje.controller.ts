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
        return {success: true, data: response.data};
      } else {
        return {success: false, message: response.message};
      }
  }

  @Get('/admin')
  async findAll() {
    return this.marcajeService.findAll();
  }

  @Get('/date/:id')
  findByDate(
    @Param('id') id: number,
    @Body() dateInterval: PeriodDto) {
    return this.marcajeService.getByPeriod(id, dateInterval);
  }

  
  @Get('/user/:id/week')
  obtainWeekStart(@Param('id') id: number) {
    return this.marcajeService.getWeekStart(id);
  }
  

  @Get('/user/:id/today')
  existTimeRegistration(@Param('id') id:number) {
    return this.marcajeService.findFromTodayType(id);
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
