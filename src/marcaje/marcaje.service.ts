import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateMarcajeDto } from '../dto/create-marcaje.dto';
import { UpdateMarcajeDto } from '../dto/update-marcaje.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Marcaje } from '../entities/marcaje.entity';
import { Between, Repository } from 'typeorm';
import * as moment from 'moment-timezone';
import axios, { all } from 'axios';
import { Interface } from 'readline';
import { MarcajeType } from '../enum/marcaje-type.enum';
import { PeriodDto } from '../dto/get-marcaje-dates';
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

  async createMarcaje(
    token: string,
    latCoordinate: string,
    longCoordinate: string,
  ) {
    try {
      console.log('Token recibido:', token);
      const endpoint: string = `${process.env.EXPO_PUBLIC_MS_USER_URL}/auth/profile`;
      console.log(endpoint);
      const response = await axios.post<ResponseDto | ErrorResponse>(
        endpoint,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      const mark = new Marcaje();

      if (latCoordinate) {
        mark.latCoordinate = latCoordinate;
      }

      if (longCoordinate) {
        mark.longCoordinate = longCoordinate;
      }

      console.log('Respuesta:', response.data);
      mark.id_user = (response.data as ResponseDto).id;

      const today = moment().format('DD-MM-YYYY');
      const tomorrow = moment().add(1, 'days').format('DD-MM-YYYY');

      const period: PeriodDto  = 
      {
        startDate: today,
        endDate: tomorrow
      }
      const entryMark = await this.findFromToday(
        mark.id_user,
        MarcajeType.ENTRY,
        period,
      );
      if (entryMark) {
        const exitMarc = await this.findFromToday(
          mark.id_user,
          MarcajeType.EXIT,
          period,
        );
        console.log('marcaje de entrada existe');
        if (exitMarc) {
          console.log('marcaje salida existe');
          return {
            success: false,
            message: 'Ya se registró marcaje de entrada y salida',
          };
        } else {
          console.log('marcaje salida no existe');
          mark.type = MarcajeType.EXIT;
          const savedMarcaje = await this.marcajeRepository.save(mark);
          const formattedMarcaje = await this.formatDate([savedMarcaje]);
          return { success: true, data: formattedMarcaje[0] };
        }
      } else {
        const savedMark = await this.marcajeRepository.save(mark);
        const formattedMarcaje = await this.formatDate([savedMark]);
        return { success: true, data: formattedMarcaje[0] };
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        //Axios error ---> Fallo utilizando axios
        //401 error de autenticación
        return { success: false, message: 'Autenticación inválida' };
      }

      return { success: false, message: 'Ocurrió un error inesperado' };
    }
  }
  
  async formatDate(marks: Marcaje[]) {
    return marks.map((mark) => ({
      id: mark.id,
      id_user: mark.id_user,
      date: moment
        .utc(mark.date)
        .tz('America/Santiago')
        .format('DD-MM-YYYY HH:mm:ss'),
      type: mark.type,
      adminFlag: mark.adminFlag,
      latCoordinate: mark.latCoordinate,
      longCoordinate: mark.longCoordinate,
    }));
  }
  async findAll() {
    const marks = await this.marcajeRepository.find({
      order: {
        date: 'DESC',
      },
    });
    return this.formatDate(marks);
  }

  async findAllFromUser(id: number) {
    const marks = await this.marcajeRepository.find({
      where: {
        id_user: id,
      },
      order: {
        date: 'DESC',
      },
    });

    return this.formatDate(marks);
  }

  findFromToday(id: number, type: MarcajeType, period: PeriodDto) {
      const {startDate} = period;
      const {endDate} = period;
      
      const start = moment(startDate, "DD-MM-YYYY").toDate();
      const end = moment(endDate, "DD-MM-YYYY").toDate();

    return this.marcajeRepository.findOne({
      where: {
        date: Between(start, end),
        type: type,
        id_user: id,
      },
    });
  }

  async findFromTodayType(idUser: number, period: PeriodDto) {
    const exitRegister = await this.findFromToday(idUser, MarcajeType.EXIT, period);
    if (exitRegister) {
      console.log(exitRegister);
      return 2;
    }
    const entryRegister = await this.findFromToday(idUser, MarcajeType.ENTRY, period);
    if (entryRegister) {
      console.log(entryRegister);
      return 1;
    }
    return 0;
  }

  async update(id: number, date: string) {
    console.log('Original date:', date);
    if (!moment(date, 'DD-MM-YYYY HH:mm:ss', true).isValid()) {
      console.log( `Fecha inválida: ${date}`);
      return null;
    }

    const convertedDate = this.convertDate(date);
    console.log('utc Date', convertedDate);
    await this.marcajeRepository.update(id, {
      date: convertedDate,
      adminFlag: true,
    });
    return this.marcajeRepository.findOne({
      where: {
        id: id,
      },
    });
  }

  convertDate(date: string) {
    const newDate =  moment(date, 'DD-MM-YYYY HH:mm:ss')
    .add(4, 'hour')
    .format('YYYY-MM-DD HH:mm:ss.SSSSSS+00');
    console.log('utc Date', newDate);
    return newDate;
  }

  remove(id: number) {
    return 'remove';
  }

  removeAll() {
    this.marcajeRepository.clear();
    return 'Clear';
  }

  async getByPeriod(idUser: number, startDate: string, endDate: string) {
    const fromDate = moment(startDate, 'DD-MM-YYYY').toDate();
    console.log('Fecha de entrada:', fromDate);

    const untilDate = moment(endDate, 'DD-MM-YYYY').toDate();
    console.log('Fecha de salida:', untilDate);

    const marks: Marcaje[] = await this.marcajeRepository.find({
      where: {
        date: Between(fromDate, untilDate),
        id_user: idUser,
      },
    });
    return this.formatDate(marks);
  }

  stringtoDate(date: string) {
    const dateFormat = moment(date.split(' '), 'DD-MM-YYYY').toDate();
    return dateFormat;
  }

  stringtoDatePlus(date: string) {
    const dateFormat = moment(date.split(' '), 'DD-MM-YYYY')
      .add(1, 'days')
      .toDate();
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
      },
      order: {
        date: 'DESC',
      },
    });

    return this.formatDate(marks);
  }

  async adminCreate(token: string, idUser: number, date: string) {

    console.log('Token recibido:', token);
    const endpoint: string = `${process.env.EXPO_PUBLIC_MS_USER_URL}/auth/admin/role`;
    console.log(endpoint);

    try {
      const response = await axios.post<ResponseDto | ErrorResponse>(endpoint, {}, {
        headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.log(error.response?.status);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        //Axios error ---> Fallo utilizando axios
        //401 error de autenticación
        console.log("Autenticación inválida");
        return { success: false, message: 'Autenticación inválida' };
      } 
      else if (axios.isAxiosError(error) && error.response?.status === 403) {
        //Axios error ---> Fallo utilizando axios
        //401 error de autenticación
        console.log("Permisos insuficientes");
        return { success: false, message: 'Permisos insuficientes' }; 
      } else {return {success: false, message: 'Error desconocido'}}
    }
        
    console.log('Original date:', date);
    if (!moment(date, 'DD-MM-YYYY HH:mm:ss', true).isValid()) {
      console.log('Fecha inválida');
      return {success: false, message: `fecha ${date} posee un formato inválido, debe ser DD-MM-YYYY`};
    } 
    const startDate = moment(date.split(' '), 'DD-MM-YYYY').format('DD-MM-YYYY');
    const endDate = moment(date.split(' '), 'DD-MM-YYYY').add(1, 'days').format('DD-MM-YYYY');
    console.log(startDate);
    console.log(endDate);

    const mark = new Marcaje();
    mark.latCoordinate = '0';
    mark.longCoordinate = '0';
    mark.adminFlag = true;
    mark.id_user = idUser;

    const period: PeriodDto  = 
      {
        startDate: startDate,
        endDate: endDate
      }
    const entryMark = await this.findFromToday(
      idUser,
      MarcajeType.ENTRY,
      period,
    );
    if (entryMark) {
      console.log(entryMark);
      const exitMarc = await this.findFromToday(
        idUser,
        MarcajeType.EXIT,
        period,
      );
      console.log('marcaje de entrada existe');
      if (exitMarc) {
        console.log('marcaje salida existe');
        return {
          success: false,
          message: 'Ya se registró marcaje de entrada y salida',
        }
        } else {
          console.log('marcaje salida no existe');
          /*
          const entryDate = moment(this.convertDate(date)).toDate();
          const exitDate = moment(entryMark.date).toDate();
          if(entryDate < exitDate) {
            return {
              success: false,
              message: `Fecha de entrada ${entryDate} < fecha salida ${exitDate}`
            };
          }
          */
          mark.type = MarcajeType.EXIT;
          let savedMarcaje = await this.marcajeRepository.save(mark);
          console.log('Marcaje guardado');
          console.log(savedMarcaje);
          savedMarcaje = await this.update(mark.id, date);
          console.log('Marcaje optimizado');
          console.log(savedMarcaje);
          const formattedMarcaje = await this.formatDate([savedMarcaje]);
          console.log("marcaje formateado");
          console.log(formattedMarcaje);
          return { success: true, data: formattedMarcaje[0] };
        }
      } else {
        let savedMarcaje = await this.marcajeRepository.save(mark);
          console.log('Marcaje guardado');
          console.log(savedMarcaje);
          savedMarcaje = await this.update(mark.id, date);
          console.log('Marcaje optimizado');
          console.log(savedMarcaje);
          const formattedMarcaje = await this.formatDate([savedMarcaje]);
          console.log("marcaje formateado");
          console.log(formattedMarcaje);
        return { success: true, data: formattedMarcaje[0] };
      }
      
  }
  


}
