import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateMarcajeDto } from './dto/create-marcaje.dto';
import { UpdateMarcajeDto } from './dto/update-marcaje.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Marcaje } from './entities/marcaje.entity';
import { Repository } from 'typeorm';
import * as moment from 'moment-timezone';
import axios from 'axios';
import { Interface } from 'readline';

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
      marcaje.date =  moment()
      .tz('America/Santiago')
      .format('DD-MM-YYYY HH:mm:ss');
      console.log("Respuesta:", response.data);
      marcaje.id_user = (response.data as ResponseDto).id;
      return {success: true, data: await this.marcajeRepository.save(marcaje)};
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        //Axios error ---> Fallo utilizando axios
        //401 error de autenticación 
        return {success: false, message: "Autenticación inválida"}
      }
      return {success: false, message: "Ocurrió un error inesperado"};
    }
    /*
      if(response.data) {
        const marcaje = new Marcaje();
        marcaje.date =  moment()
        .tz('America/Santiago')
        .format('DD-MM-YYYY HH:mm:ss');
        marcaje.id_user = response2.data;
        return  { success: true, data: await this.marcajeRepository.save(marcaje)};
      } else {
        return { success: false, message: 'Token Inválido'}
      }

    } catch (error: unknown) {
      return { success: false, message: 'Ocurrió un error' };
    }
    */
  }

  findAll() {
    return this.marcajeRepository.find();
  }

  findFromUser(id: number) {
    return this.marcajeRepository.find({
      where: {
        id_user: id,
      }
    })
  }

  update(id: number, updateMarcajeDto: UpdateMarcajeDto) {
    return `This action updates a #${id} marcaje`;
  }

  remove(id: number) {
    return `This action removes a #${id} marcaje`;
  }
}
