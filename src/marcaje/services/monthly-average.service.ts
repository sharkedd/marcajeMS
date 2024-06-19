import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MonthlyAverageHours } from 'src/entities/monthly-average-hours';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as moment from 'moment';

@Injectable()
export class MonthlyAverageHoursService {

  constructor(
    @InjectRepository(MonthlyAverageHours)
    private readonly monthlyUserHoursRepository: Repository<MonthlyAverageHours>,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async updateMonthlyUserHours(): Promise<void> {
    console.log(`Monthly Cron en progreso `);
    await this.monthlyUserHoursRepository.query(
      `DELETE FROM "monthly-average-hours"`,
    );

    await this.monthlyUserHoursRepository.query(`
    with dailyMarks AS (
      SELECT
          id_user as idUser,
          "type",
          "date"::date AS "day",
          "date"
       FROM marcajes
  ),
  timeMarks AS (
      select
        idUser,
          "day",
          MAX(CASE WHEN "type" = 'entry' THEN "date" END) AS entryTime,
          MAX(CASE WHEN "type" = 'exit' THEN "date" END) AS exitTime
      FROM dailyMarks
      GROUP BY idUser, day
  ),
  monthMarks as (
    select 
      idUser as "user",
      "day",
      entryTime,
      exitTime,
      extract (epoch from (exitTime - entryTime)/3600) as hoursWorked
    from timeMarks
    where (entryTime is not null) and (exitTime is not null)
  )
  INSERT INTO "monthly-average-hours" ("idUser", month, average_hours_worked)
  select 
    "user",
    TO_CHAR(DATE_TRUNC('month', "day"), 'YYYY-MM') as month,
    avg(hoursworked) as average
  from monthMarks
  group by TO_CHAR(DATE_TRUNC('month', "day"), 'YYYY-MM'), "user"
  
    `);
  }

  async getMonthlyUserHours(): Promise<MonthlyAverageHours[]> {    
    const monthlyHoursWork = await this.monthlyUserHoursRepository.find();
    return monthlyHoursWork.map(monthlyHoursWork => ({
      id: monthlyHoursWork.id,
      idUser: monthlyHoursWork.idUser,
      month: moment(monthlyHoursWork.month).format('DD-MM-YYYY'),
      average_hours_worked: monthlyHoursWork.average_hours_worked,
    }));
    
  }
}
