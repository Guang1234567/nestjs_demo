import { DynamicModule, Module } from '@nestjs/common';
import { DogsController } from './dogs.controller';
import { DogsService } from './dogs.service';

@Module({
  controllers: [DogsController],
  providers: [DogsService],
  exports: [DogsService],
})
export class DogsModule {
  static forPets(): DynamicModule {
    return {
      module: DogsModule,
      providers: [DogsService],
      exports: [DogsService],
    };
  }
}
