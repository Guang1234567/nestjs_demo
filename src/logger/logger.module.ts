import {
  DynamicModule,
  Logger as NestInternalLogger,
  MiddlewareConsumer,
  /* Global, */ Module,
  NestModule,
  RequestMethod,
  Scope,
  INestApplication,
  Type,
} from '@nestjs/common';
import { BussinessLoggerService } from './bussiness-logger.service';
import { LoggerModuleOptions } from './logger.interface';
import { HttpLoggerMiddleware } from './http-logger.middleware';
import { INQUIRER } from '@nestjs/core';

//@Global()
@Module({
  //providers: [InquirerContextLoggerService],
  //exports: [InquirerContextLoggerService],
})
export class LoggerModule implements NestModule {
  static forRoot(
    rootContext: string,
    options: LoggerModuleOptions = {
      options: { format: 'pretty' },
      autoLogging: true,
    },
  ): DynamicModule {
    const nestInternalLogger = new NestInternalLogger(rootContext, {
      timestamp: true,
    });

    return {
      module: LoggerModule,
      providers: [
        {
          provide: NestInternalLogger,
          useValue: nestInternalLogger,
          scope: Scope.DEFAULT,
        },
        {
          provide: BussinessLoggerService,
          useFactory: (
            parentClass: object,
            options: LoggerModuleOptions,
            nestInternalLogger: NestInternalLogger,
          ) => {
            let ctx = parentClass?.constructor?.name;
            if (
              parentClass === undefined ||
              parentClass === BussinessLoggerService
            ) {
              ctx = rootContext;
            }
            return new BussinessLoggerService(ctx, options, nestInternalLogger);
          },
          inject: [INQUIRER, LoggerModuleOptions, NestInternalLogger],
          scope: Scope.TRANSIENT,
        },
        {
          provide: LoggerModuleOptions,
          useValue: options,
          scope: Scope.DEFAULT,
        },
      ],
      exports: [
        BussinessLoggerService,
        LoggerModuleOptions,
        NestInternalLogger,
      ],
      global: true, // 全局可用
    };
  }

  constructor(private readonly options: LoggerModuleOptions) {}

  configure(consumer: MiddlewareConsumer) {
    const autoLogging = this.options.autoLogging;
    if (autoLogging) {
      consumer
        .apply(HttpLoggerMiddleware)
        .forRoutes({ path: '*', method: RequestMethod.ALL });
    }
  }

  public static resolvedBy<
    TInput extends
      | BussinessLoggerService
      | NestInternalLogger
      | LoggerModuleOptions,
    TResult = TInput,
  >(app: INestApplication, typeOrToken: Type<TInput>): Promise<TResult> {
    return app.resolve(typeOrToken);
  }
}
