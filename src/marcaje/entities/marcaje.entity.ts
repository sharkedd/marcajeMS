import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'marcajes'})
export class Marcaje {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    id_user: number;

    @Column()
    date: string;

}
