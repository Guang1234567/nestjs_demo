import { DynamicModule, Module } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';

/**
 *The annotation returns a StaticModule, which is generally only introduced in AppModule.
 *It provides CatsService and CatsController.
 *
 *At the same time, it also provides a static method forPets(), which is used when introducing CatsModule into other Modules (such as PetsModule).
 *You can choose whether to introduce CatsService and CatsController into the Module.
 */
@Module({
  controllers: [CatsController],
  providers: [CatsService],
  exports: [CatsService],
})
export class CatsModule {
  /**
   * 返回的是一个 DynamicModule.
   * 这种写法主要用于在其他 Module 中引入 CatsModule 时，
   * 可以选择是否引入 CatsService 和 CatsController 到该 Module 中.
   */
  static forPets(): DynamicModule {
    return {
      module: CatsModule,
      providers: [CatsService],
      exports: [CatsService],
    };
  }
}
