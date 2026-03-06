import { ConsoleLogger, LoggerService, LogLevel } from '@nestjs/common';
import { LoggerModuleOptions } from './logger.interface';
import { Logger as NestInternalLogger } from '@nestjs/common';

/**
 * 上下文感知的业务日志服务。
 *
 * - 基于 ConsoleLogger 的轻量包装，按注入者设置 context；
 * - 受 {@link LoggerModuleOptions.autoLogging} 控制，
 *   关闭时抑制所有输出（方法为 no-op）；
 * - 提供常用日志方法（log/error/warn/debug/verbose/fatal）、级别设置与上下文设置；
 * - 使用 Nest 内部 {@link NestInternalLogger} 进行构造期自检输出。
 *
 * 构造参数
 * @param context 调用方上下文名称（一般为类名）
 * @param options 模块配置（含 autoLogging 开关）
 * @param nestInternalLogger Nest 内部 Logger，用于内部日志
 *
 * @example
 * import { BussinessLoggerService } from '../logger/bussiness-logger.service';
 * export class PetsController {
 *   constructor(
 *     private readonly catsService: CatsService,
 *     private readonly dogsService: DogsService,
 *     private readonly logger: BussinessLoggerService,
 *   ) {
 *     this.logger.log(
 *       'PetsController instance created with CatsService and DogsService injected',
 *     );
 *   }
 */

export class InquirerContextLoggerService implements LoggerService {
  private logger: ConsoleLogger | undefined;

  constructor(
    private readonly context: string,
    private readonly options: LoggerModuleOptions,
    private readonly nestInternalLogger: NestInternalLogger,
  ) {
    nestInternalLogger.log(
      `new InquirerContextLoggerService: context = ${context}`,
    );
    const autoLogging = this.options.autoLogging;
    if (autoLogging) {
      this.logger = new ConsoleLogger(context, { timestamp: true });
    }
  }

  log(message: any, ...optionalParams: any[]) {
    this.logger?.log(message, ...optionalParams);
  }

  error(message: any, ...optionalParams: any[]) {
    this.logger?.error(message, ...optionalParams);
  }

  warn(message: any, ...optionalParams: any[]) {
    this.logger?.warn(message, ...optionalParams);
  }

  debug(message: any, ...optionalParams: any[]) {
    this.logger?.debug(message, ...optionalParams);
  }

  verbose(message: any, ...optionalParams: any[]) {
    this.logger?.verbose(message, ...optionalParams);
  }

  fatal(message: any, ...optionalParams: any[]) {
    this.logger?.fatal(message, ...optionalParams);
  }

  setLogLevels(levels: LogLevel[]): any {
    this.logger?.setLogLevels(levels);
  }

  setContext(context: string): void {
    this.logger?.setContext(context);
  }
}
