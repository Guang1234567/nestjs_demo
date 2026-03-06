import { Module } from '@nestjs/common';
import { PetsController } from './pets.controller';
import { CatsModule } from '@/cats/cats.module';
import { DogsModule } from '@/dogs/dogs.module';

const _petDependedModules = [CatsModule.forPets(), DogsModule.forPets()];

@Module({
  imports: [..._petDependedModules],
  exports: [..._petDependedModules],
  controllers: [PetsController],
})
export class PetsModule {}
