import { Injectable } from '@nestjs/common';
import { CreateMarcajeDto } from './dto/create-marcaje.dto';
import { UpdateMarcajeDto } from './dto/update-marcaje.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Marcaje } from './entities/marcaje.entity';
import { Repository } from 'typeorm';
import * as moment from 'moment-timezone';
import axios from 'axios';

@Injectable()
export class MarcajeService {
  constructor(
    @InjectRepository(Marcaje) private marcajeRepository: Repository<Marcaje>,
  ) {}

  async createMarcaje(marcajeDto: CreateMarcajeDto) {
    const { token } = marcajeDto;
    const fechaActual = moment()
      .tz('America/Santiago')
      .format('DD-MM-YYYY HH:mm:ss');
    console.log(token);
    console.log(fechaActual);

    try {
      const endpoint: string = `${process.env.EXPO_PUBLIC_MS_USER_URL}/auth/${token}`;
      const response = await axios.get(endpoint);

      const endpoint2: string = `${process.env.EXPO_PUBLIC_MS_USER_URL}/auth/${token}`;
      const response2 = await axios.post(endpoint2);

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
