import { Injectable } from '@nestjs/common';
import { AppConfigService } from './config/app.config';

@Injectable()
export class AppService {
  constructor(private readonly appConfigService: AppConfigService) {}

  getHello(): string {
    return 'Hello World!';
  }

  getAppConfiguration() {
    return 'Hello World!';
  }
}
