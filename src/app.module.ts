import { Module } from '@nestjs/common';
import { AppConfigModule, useImport } from './config/app.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CatsModule } from './cats/cats.module';

@Module({
  imports: [
    AppConfigModule,
    // CatsModule,
    useImport(async (/* appConfig: AppConfig, */ env: NodeJS.ProcessEnv) => {
      return env['USE_MODULE_CATS'] === 'true'
        ? {
            module: CatsModule,
          }
        : {
            module: CatsModule,
          };
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
