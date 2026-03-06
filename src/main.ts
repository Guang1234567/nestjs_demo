import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppService } from './app.service';
import { AppConfig, AppEnvironment } from './config/app.config';
import { BussinessLoggerService } from './logger/bussiness-logger.service';
import { Logger as NestInternalLogger } from '@nestjs/common';
import { LoggerModule } from './logger/logger.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { abortOnError: false });

  const nestInternalLogger = await LoggerModule.resolvedBy(
    app,
    NestInternalLogger,
  );
  app.useLogger(nestInternalLogger);
  app.flushLogs();

  const bussinessLogger = await LoggerModule.resolvedBy(
    app,
    BussinessLoggerService,
  );
  bussinessLogger.warn('Starting application...');

  const appService = app.get(AppService);
  const nodeEnv: AppEnvironment = appService.nodeEnv;
  const appConfig: AppConfig = appService.config;

  await app.listen(appConfig.port);

  bussinessLogger.warn(
    `Application (${nodeEnv}) is running on: ${await app.getUrl()}`,
  );
}
bootstrap().catch((err) => NestInternalLogger.fatal(err));
