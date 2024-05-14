import { Test, TestingModule } from '@nestjs/testing';
import { MarcajeService } from './marcaje.service';

describe('MarcajeService', () => {
  let service: MarcajeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MarcajeService],
    }).compile();

    service = module.get<MarcajeService>(MarcajeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
