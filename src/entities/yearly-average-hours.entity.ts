import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('yearly-average-hours')
export class YearlyAverageHours {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  year: string;

  @Column('float')
  average_hours_worked: number;
}