import { Module } from '@nestjs/common';
import { MarcajeService } from '../services/marcaje.service';
import { MarcajeController } from '../controllers/marcaje.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Marcaje } from '../../entities/marcaje.entity';
import { MonthlyAverageHours } from 'src/entities/monthly-average-hours';
import { MonthlyAverageHoursService } from '../services/monthly-average.service';
import { StatisticsController } from '../controllers/statistics.controller';
import { YearlyAverageHourService } from '../services/yearly-average.service';
import { YearlyAverageHours } from 'src/entities/yearly-average-hours.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Marcaje, MonthlyAverageHours, YearlyAverageHours])],
  controllers: [MarcajeController, StatisticsController],
  providers: [MarcajeService, MonthlyAverageHoursService, YearlyAverageHourService],
})
export class MarcajeModule {}
