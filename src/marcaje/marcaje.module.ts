import { Module } from '@nestjs/common';
import { MarcajeService } from './marcaje.service';
import { MarcajeController } from './marcaje.controller';

@Module({
  controllers: [MarcajeController],
  providers: [MarcajeService],
})
export class MarcajeModule {}
