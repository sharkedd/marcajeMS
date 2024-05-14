import { Injectable } from '@nestjs/common';
import { CreateMarcajeDto } from './dto/create-marcaje.dto';
import { UpdateMarcajeDto } from './dto/update-marcaje.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Marcaje } from './entities/marcaje.entity';
import { Repository } from 'typeorm';
import * as moment from 'moment-timezone';


@Injectable()
export class MarcajeService {
  constructor(
    @InjectRepository(Marcaje) private marcajeRepository: Repository<Marcaje>,
  ) {}

  createMarcaje(marcajeDto: CreateMarcajeDto) {
    const { id_user } = marcajeDto;
    const fechaActual = moment().tz('America/Santiago').toDate();
    console.log(id_user);
    console.log(fechaActual);
  }

  findAll() {
    return `This action returns all marcaje`;
  }

  findOne(id: number) {
    return `This action returns a #${id} marcaje`;
  }

  update(id: number, updateMarcajeDto: UpdateMarcajeDto) {
    return `This action updates a #${id} marcaje`;
  }

  remove(id: number) {
    return `This action removes a #${id} marcaje`;
  }
}
