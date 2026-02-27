import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { AppService } from './app.service';
import { AppConfig, AppEnvironment } from './config/app.config';

async function bootstrap() {
  const logger = new Logger('Bootstrap', { timestamp: true });
  logger.warn('Starting application...');

  const app = await NestFactory.create(AppModule, { abortOnError: false });

  const appService = app.get(AppService);
  const nodeEnv: AppEnvironment = appService.nodeEnv;
  const appConfig: AppConfig = appService.config;

  await app.listen(appConfig.port);

  logger.warn(`Application (${nodeEnv}) is running on: ${await app.getUrl()}`);
}
bootstrap();
