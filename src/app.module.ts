import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MarcajeModule } from './marcaje/marcaje.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Marcaje } from './marcaje/entities/marcaje.entity';


@Module({
  imports: [TypeOrmModule.forRoot({
    type: 'mysql',
    host: '127.0.0.1',
    port: 3306,
    username: 'root',
    password: 'jmcr0612',
    database: 'usersDB',
    entities: [Marcaje],
    synchronize: true,
  }),MarcajeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
