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
      console.log(token);
      const endpoint: string = `${process.env.EXPO_PUBLIC_MS_USER_URL}/auth/profile`;
      console.log(endpoint);
      const response = await axios.post<ResponseDto | ErrorResponse>(endpoint, {}, {
        headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
        }
      });
      const marcaje = new Marcaje();
      console.log("Respuesta:", response.data);
      marcaje.id_user = (response.data as ResponseDto).id;
      
      const entryMarcaje = await this.findFromToday(marcaje.id_user, MarcajeType.ENTRY)

      if(entryMarcaje) {
        const exitMarcaje = await this.findFromToday(marcaje.id_user, MarcajeType.EXIT)
        console.log('marcaje de entrada existe')
        if(exitMarcaje) {
          console.log('marcaje salida existe')
          return {success: false, message: "Ya se registró marcaje de entrada y salida"}
        } else {
          console.log('marcaje salida no existe')
          marcaje.type = MarcajeType.EXIT;
          const savedMarcaje = await this.marcajeRepository.save(marcaje);
          const formattedMarcaje = await this.formatDate([savedMarcaje]);
          return {success: true, data: formattedMarcaje[0]};
        }
      }
      else { 
        const savedMarcaje = await this.marcajeRepository.save(marcaje);
        const formattedMarcaje = await this.formatDate([savedMarcaje]);
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

  async formatDate(marcajes: Marcaje[]) {
    return marcajes.map(marcaje => ({
      id: marcaje.id,
      id_user: marcaje.id_user,
      date: moment.utc(marcaje.date).tz('America/Santiago').format('DD-MM-YYYY HH:mm:ss'),
      type: marcaje.type,
    }));
  } 
  async findAll() {
    const marcajes = await this.marcajeRepository.find();
    return this.formatDate(marcajes);
  }

  findAllFromUser(id: number) {
    return this.marcajeRepository.find({
      where: {
        id_user: id,
      }
    })
  }

  findFromToday(id: number, type: MarcajeType) {
    const today = this.stringtoDate(moment().format('DD-MM-YYYY'));
    const tomorrow = this.stringtoDate((moment().add(1, 'days')).format('DD-MM-YYYY'));

    return this.marcajeRepository.findOne({
      where: {
        date: Between(today, tomorrow),
        type: type,
      }
    })
  }

  findFromTodayType(id: number, type: string) {
    const enumType: MarcajeType = MarcajeType[type.toUpperCase() as keyof typeof MarcajeType];
    
    if(!enumType) {
      throw new Error('Tipo de marcaje inválido (Este debe ser entry o exit)', )
    }

    return this.findFromToday(id, enumType);
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

  getByPeriod(dateInterval: PeriodDto) {
    const fromDate = this.stringtoDate(dateInterval.fechaInicio);
    const untilDate = this.stringtoDate(dateInterval.fechaFin);

    return this.marcajeRepository.find({
      where: {
        date: Between(fromDate, untilDate),
      }
    })
  }

  stringtoDate(date: string) {
    const dateFormat = moment(date.split(' '), 'DD-MM-YYYY').toDate();
    return dateFormat;
  }
}
