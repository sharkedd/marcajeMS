import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MarcajeModule } from './marcaje/marcaje.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Marcaje } from './marcaje/entities/marcaje.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '127.0.0.1',
      port: 5432,
      username: 'postgres',
      password: 'jmcr0612',
      database: 'postgres',
      entities: [Marcaje],
      synchronize: true,
    }),
    ConfigModule.forRoot(),
    MarcajeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
