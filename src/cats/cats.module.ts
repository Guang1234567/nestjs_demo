import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';
//import { ConfigModule } from '@nestjs/config';

@Module({
  //imports: [ConfigModule.forFeature(databaseConfig)],
  controllers: [CatsController],
  providers: [CatsService],
})
export class CatsModule {}
