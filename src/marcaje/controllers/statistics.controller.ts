import { Controller, Get } from '@nestjs/common';
import { MonthlyAverageHoursService } from '../services/monthly-average.service';
import { MonthlyAverageHours } from 'src/entities/monthly-average-hours';
import { YearlyAverageHourService } from '../services/yearly-average.service';
import { YearlyAverageHours } from 'src/entities/yearly-average-hours.entity';

@Controller('statistics')
export class StatisticsController {
    constructor( 
        private readonly monthlyService: MonthlyAverageHoursService,
        private readonly yearlyService: YearlyAverageHourService) {}

    @Get('/monthly') 
    async getMonthlyUserHours(): Promise<MonthlyAverageHours[]> {
        return this.monthlyService.getMonthlyUserHours();
      }

    @Get('/yearly') 
    async getYearlyUserHours(): Promise<YearlyAverageHours[]> {
        return this.yearlyService.getYearlyUserHours();
      }
}
