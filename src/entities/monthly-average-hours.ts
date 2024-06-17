import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('monthly-average-hours')
export class MonthlyAverageHours {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  month: string;

  @Column('float')
  average_hours_worked: number;
}
