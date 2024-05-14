import { Test, TestingModule } from '@nestjs/testing';
import { MarcajeController } from './marcaje.controller';
import { MarcajeService } from './marcaje.service';

describe('MarcajeController', () => {
  let controller: MarcajeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MarcajeController],
      providers: [MarcajeService],
    }).compile();

    controller = module.get<MarcajeController>(MarcajeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
