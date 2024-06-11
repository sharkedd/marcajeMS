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
import { CreateMarcajeDto } from '../dto/create-marcaje.dto';
import { UpdateMarcajeDto } from '../dto/update-marcaje.dto';
import { timeInterval } from 'rxjs';
import { PeriodDto } from '../dto/get-marcaje-dates';
import { MarcajeType } from '../enum/marcaje-type.enum';
import { AdminMarcajeDto } from 'src/dto/admin-marcaje.dto';

@Controller('marcaje')
export class MarcajeController {
  constructor(private readonly marcajeService: MarcajeService) {}

  @Post()
  async create(@Body() createMarcaje: CreateMarcajeDto) {

      console.log("Controller")

      const {token} = createMarcaje;
      const {latCoordinate} = createMarcaje;
      const {longCoordinate} = createMarcaje;
      const response = await this.marcajeService.createMarcaje(token, latCoordinate, longCoordinate);
      console.log("Respuesta: ", response);
      
      if (response?.success) {
        return {success: true, data: response.data};
      } else {
        return {success: false, message: response.message};
      }
  }

  @Post('/admin')
  async marcajeAdmin(@Body() adminMarcajeDto: AdminMarcajeDto) {
    
    return this.marcajeService.adminCreate();
  }

  @Get('/admin')
  async findAll() {
    return this.marcajeService.findAll();
  }

  @Post('/date/:id')
  async findByDate(
    @Param('id') id: number,
    @Body() payload: { dateInterval: { startDate: string, endDate: string } })
     {
    const startDate = payload.dateInterval.startDate;
    const endDate = payload.dateInterval.endDate;
    return await this.marcajeService.getByPeriod(id, startDate, endDate);
  }
   
  @Get('/user/week/:id')
  async obtainWeekStart(@Param('id') id: number) {
    return await this.marcajeService.getWeekStart(id);
  }
  

  @Get('/user/today/:id')
  existTimeRegistration(@Param('id') id: number) {
    return this.marcajeService.findFromTodayType(id);
  }

  @Get('/user/:id')
  findFromUser(@Param('id') id: number) {
    return this.marcajeService.findAllFromUser(+id);
  }

  @Patch('/admin/:id')
  update(@Param('id') id: number, @Body() updateMarcaje: UpdateMarcajeDto) {
    const {date} = updateMarcaje;  
    return this.marcajeService.update(id, date);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.marcajeService.remove(+id);
  }


}
