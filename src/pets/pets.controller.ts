import { Controller, Get } from '@nestjs/common';
import { CatsService, Cat } from '@/cats/cats.service';
import { DogsService, Dog } from '@/dogs/dogs.service';
import { BussinessLoggerService } from '@/logger/bussiness-logger.service';

@Controller({
  path: 'pets',
})
export class PetsController {
  constructor(
    private readonly catsService: CatsService,
    private readonly dogsService: DogsService,
    private readonly logger: BussinessLoggerService,
  ) {
    this.logger.log(
      'PetsController instance created with CatsService and DogsService injected',
    );
  }

  /**
   * 演示方法：获取所有宠物（猫和狗的合集）
   */
  @Get()
  findAll(): { cats: Cat[]; dogs: Dog[] } {
    this.logger.log('Fetching all pets...');
    return {
      cats: this.catsService.findAll(),
      dogs: this.dogsService.findAll(),
    };
  }

  /**
   * 演示方法：统计宠物数量
   */
  @Get('stats')
  getStats(): { totalCats: number; totalDogs: number; totalPets: number } {
    const totalCats = this.catsService.findAll().length;
    const totalDogs = this.dogsService.findAll().length;

    this.logger.log(`Pet statistics - Cats: ${totalCats}, Dogs: ${totalDogs}`);

    return {
      totalCats,
      totalDogs,
      totalPets: totalCats + totalDogs,
    };
  }

  /**
   * 演示方法：随机获取一个宠物
   */
  @Get('random')
  getRandomPet(): Cat | Dog {
    const cats = this.catsService.findAll();
    const dogs = this.dogsService.findAll();
    const allPets = [...cats, ...dogs];

    const randomIndex = Math.floor(Math.random() * allPets.length);
    const randomPet = allPets[randomIndex];

    this.logger.log(`Randomly selected a pet: ${randomPet.name}`);
    return randomPet;
  }
}
