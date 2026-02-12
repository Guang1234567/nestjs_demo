import { NestFactory } from '@nestjs/core';
import { AppConfigService } from './config/app.config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { abortOnError: false });
  const configService = app.get(AppConfigService);
  await app.listen(configService.port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
