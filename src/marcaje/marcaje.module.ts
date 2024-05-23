import { Module } from '@nestjs/common';
import { MarcajeService } from './marcaje.service';
import { MarcajeController } from './marcaje.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Marcaje } from './entities/marcaje.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Marcaje])],
  controllers: [MarcajeController],
  providers: [MarcajeService],
})
export class MarcajeModule {}
