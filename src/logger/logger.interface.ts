export class LoggerOptions {
  readonly format: 'pretty' | 'json';
}

export class LoggerModuleOptions {
  readonly options: LoggerOptions;
  readonly autoLogging: boolean;
}
