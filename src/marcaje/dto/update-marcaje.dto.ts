import { PartialType } from '@nestjs/mapped-types';
import { CreateMarcajeDto } from './create-marcaje.dto';

export class UpdateMarcajeDto extends PartialType(CreateMarcajeDto) {}
