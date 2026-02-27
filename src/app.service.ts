import { Injectable } from '@nestjs/common';
import { AppEnvironment, AppConfig } from './config/app.config';

@Injectable()
export class AppService {
  constructor(
    public readonly nodeEnv: AppEnvironment,
    public readonly config: AppConfig,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }
}
