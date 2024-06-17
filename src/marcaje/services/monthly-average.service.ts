import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MonthlyAverageHours } from 'src/entities/monthly-average-hours';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class MonthlyAverageHoursService {

  constructor(
    @InjectRepository(MonthlyAverageHours)
    private readonly monthlyUserHoursRepository: Repository<MonthlyAverageHours>,
  ) {}

  @Cron(CronExpression.EVERY_10_HOURS)
  async updateMonthlyUserHours(): Promise<void> {
    console.log(`Cron en progreso `);
    await this.monthlyUserHoursRepository.query(
      `DELETE FROM "monthly-average-hours"`,
    );

    await this.monthlyUserHoursRepository.query(`
      WITH dailyMarks AS (
        SELECT
          id_user as idUser,
          "type",
          "date"::date AS "day",
          "date"
        FROM marcajes
      ),
      timeMarks AS (
        SELECT
          idUser,
          "day",
          MAX(CASE WHEN "type" = 'entry' THEN "date" END) AS entryTime,
          MAX(CASE WHEN "type" = 'exit' THEN "date" END) AS exitTime
        FROM dailyMarks
        GROUP BY idUser, day
      ),
      monthMarks AS (
        SELECT 
          idUser as "user",
          "day",
          entryTime,
          exitTime,
          EXTRACT(epoch FROM (exitTime - entryTime))/3600 AS hoursWorked
        FROM timeMarks
        WHERE (entryTime IS NOT NULL) AND (exitTime IS NOT NULL)
      )
      INSERT INTO "monthly-average-hours" (user_id, month, average_hours_worked)
      SELECT 
        "user",
        TO_CHAR(DATE_TRUNC('month', "day"), 'YYYY-MM') AS month,
        AVG(hoursWorked) AS average
      FROM monthMarks
      GROUP BY TO_CHAR(DATE_TRUNC('month', "day"), 'YYYY-MM'), "user";
    `);
  }

  async getMonthlyUserHours(): Promise<MonthlyAverageHours[]> {
    return await this.monthlyUserHoursRepository.find();
  }
}
