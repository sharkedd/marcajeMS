import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateMarcajeDto } from './dto/create-marcaje.dto';
import { UpdateMarcajeDto } from './dto/update-marcaje.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Marcaje } from './entities/marcaje.entity';
import { Between, Repository } from 'typeorm';
import * as moment from 'moment-timezone';
import axios, { all } from 'axios';
import { Interface } from 'readline';
import { MarcajeType } from './enum/marcaje-type.enum';
import { PeriodDto } from './dto/get-marcaje-dates';
import { format } from 'path';

interface ResponseDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  birthday: string;
}

interface ErrorResponse {
  message: string;
  statusCode: number;
}

@Injectable()
export class MarcajeService {

  constructor(
    @InjectRepository(Marcaje) private marcajeRepository: Repository<Marcaje>,
  ) {}

  async createMarcaje(token: string) {

    try {
      console.log('Token recibido:', token);
      const endpoint: string = `${process.env.EXPO_PUBLIC_MS_USER_URL}/auth/profile`;
      console.log(endpoint);
      const response = await axios.post<ResponseDto | ErrorResponse>(endpoint, {}, {
        headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
        },
        
      },);
      const mark = new Marcaje();
      console.log("Respuesta:", response.data);
      mark.id_user = (response.data as ResponseDto).id;
      const entryMark = await this.findFromToday(mark.id_user, MarcajeType.ENTRY)
      if(entryMark) {
        const exitMarc = await this.findFromToday(mark.id_user, MarcajeType.EXIT)
        console.log('marcaje de entrada existe')
        if(exitMarc) {
          console.log('marcaje salida existe')
          return {success: false, message: "Ya se registró marcaje de entrada y salida"}
        } else {
          console.log('marcaje salida no existe')
          mark.type = MarcajeType.EXIT;
          const savedMarcaje = await this.marcajeRepository.save(mark);
          const formattedMarcaje = await this.formatDate([savedMarcaje]);
          return {success: true, data: formattedMarcaje[0]};
        }
      }
      else { 
        const savedMark = await this.marcajeRepository.save(mark);
        const formattedMarcaje = await this.formatDate([savedMark]);
        return {success: true, data: formattedMarcaje[0]};
       }
      
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        //Axios error ---> Fallo utilizando axios
        //401 error de autenticación 
        return {success: false, message: "Autenticación inválida"}
      }
      
      return {success: false, message: "Ocurrió un error inesperado"};
    }
  }

  async formatDate(marks: Marcaje[]) {
    return marks.map(mark => ({
      id: mark.id,
      id_user: mark.id_user,
      date: moment.utc(mark.date).tz('America/Santiago').format('DD-MM-YYYY HH:mm:ss'),
      type: mark.type,
    }));
  } 
  async findAll() {
    const marks = await this.marcajeRepository.find();
    return this.formatDate(marks);
  }

  async findAllFromUser(id: number) {
    const marks = await this.marcajeRepository.find({
      where: {
        id_user: id,
      }
    })

    return this.formatDate(marks);
  }

  findFromToday(id: number, type: MarcajeType) {
    const today = this.stringtoDate(moment().format('DD-MM-YYYY'));
    const tomorrow = this.stringtoDate((moment().add(1, 'days')).format('DD-MM-YYYY'));

    return this.marcajeRepository.findOne({
      where: {
        date: Between(today, tomorrow),
        type: type,
        id_user: id
      }
    })
  }

  async findFromTodayType(idUser: number) {
    const exitRegister = await this.findFromToday(idUser, MarcajeType.EXIT)
    if(exitRegister) {
      console.log(exitRegister);
      return(2)
    }
    const entryRegister = await this.findFromToday(idUser, MarcajeType.ENTRY)
    if(entryRegister) {
      console.log(entryRegister);
      return(1)
    }
    
    return(0)

  }

  update(id: number, updateMarcajeDto: UpdateMarcajeDto) {
    return `This action updates a #${id} marcaje`;
  }

  remove(id: number) {
    return 'remove';
  }

  removeAll() {
    this.marcajeRepository.clear()
    return 'Clear';
  }

  async getByPeriod(idUser:number, dateInterval: PeriodDto) {
    const fromDate = this.stringtoDate(dateInterval.startDate);
    const untilDate = this.stringtoDatePlus(dateInterval.endDate);

    const marks: Marcaje[] = await this.marcajeRepository.find({
      where: {
        date: Between(fromDate, untilDate),
        id_user: idUser,
      }
    })

    return this.formatDate(marks);
  }

  stringtoDate(date: string) {
    const dateFormat = moment(date.split(' '), 'DD-MM-YYYY').toDate();
    return dateFormat;
  }

  stringtoDatePlus(date: string) {
    const dateFormat = moment(date.split(' '), 'DD-MM-YYYY').add(1, 'days').toDate();
    return dateFormat;
  }

  
  async getWeekStart(idUser: number) {
    const startOfWeek = moment().startOf('week').add(0, 'days').toDate();
    const endOfWeek = moment().endOf('week').add(1, 'days').toDate();
    console.log(startOfWeek);
    console.log(endOfWeek);

    const marks: Marcaje[] = await this.marcajeRepository.find({
      where: {
        date: Between(startOfWeek, endOfWeek),
        id_user: idUser,
      }
    })

    return this.formatDate(marks);
  }
  
}
