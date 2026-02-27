import {
  Module,
  DynamicModule,
  ExistingProvider,
  ValueProvider,
} from '@nestjs/common';
import { registerAs, ConfigModule, ConfigModuleOptions } from '@nestjs/config';
//import { ConfigType } from '@nestjs/config';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as yaml from 'js-yaml';
import * as Joi from 'joi';

const _isReadFromEnv = true;

const __NS_CONFIG_APP__ = '__NS_CONFIG_APP__';

export enum AppEnvironment {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
  PROVISION = 'provision',
}

interface _EnvFileFormat {
  PORT: number;
  AUTH_ENABLED: boolean;
  USE_MODULE_CATS: boolean;
}

interface _YamlFileFormat {
  http: {
    port: number;
  };
  auth: {
    isEnabled: boolean;
  };
  module: {
    cats: {
      isEnabled: boolean;
    };
  };
}

export class AppConfig {
  port: number;
  isAuthEnabled: boolean;
  useModuleCats: boolean;
}

const _validateAndGetNodeEnv = (): AppEnvironment => {
  const schemaForNodeEnv = Joi.string<AppEnvironment>()
    .valid(...Object.values(AppEnvironment))
    .required();

  const { error: errorForNodeEnv, value: nodeEnv } = schemaForNodeEnv.validate(
    process.env.NODE_ENV,
    {
      allowUnknown: false,
      abortEarly: true,
    },
  ) as { error?: Joi.ValidationError; value: AppEnvironment };

  if (errorForNodeEnv) {
    throw new Error(`Config validation error: ${errorForNodeEnv.message}`);
  }

  console.log(`_validateAndGetNodeEnv : "${nodeEnv}"`);
  return nodeEnv;
};

const _nodeEnv = _validateAndGetNodeEnv();

const _loadConfigFromEnvFile = (env: AppEnvironment): AppConfig => {
  console.log(`_loadConfigFromEnvFile : ".env.${env}"`);

  const cfgFromEnvFile = process.env as unknown as _EnvFileFormat;

  const schema = Joi.object<_EnvFileFormat, true>({
    PORT: Joi.number().required(),
    AUTH_ENABLED: Joi.boolean().required(),
    USE_MODULE_CATS: Joi.boolean().required(),
  });

  const { error } = schema.validate(cfgFromEnvFile, {
    allowUnknown: true,
    abortEarly: false,
  });

  if (error) {
    throw new Error(`EnvFile(.env.${env}) validation error: ${error.message}`);
  }

  return {
    port: cfgFromEnvFile.PORT,
    isAuthEnabled: cfgFromEnvFile.AUTH_ENABLED,
    useModuleCats: cfgFromEnvFile.USE_MODULE_CATS,
  };
};

const _loadConfigFromYamlFile = (env: AppEnvironment): AppConfig => {
  const YAML_CONFIG_FILENAME = `app.config.${env}.yaml`;
  console.log(`_loadConfigFromYaml : "${YAML_CONFIG_FILENAME}"`);
  const cfgFromYamlFile = yaml.load(
    readFileSync(join(__dirname, YAML_CONFIG_FILENAME), 'utf8'),
  ) as _YamlFileFormat;

  return {
    port: cfgFromYamlFile.http.port,
    isAuthEnabled: cfgFromYamlFile.auth.isEnabled,
    useModuleCats: cfgFromYamlFile.module.cats.isEnabled,
  };
};

function _createCompleter<T>() {
  let resolve: (value: T) => void;
  let reject: (reason?: any) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve: resolve!, reject: reject! };
}

const _appConfigCompleter = _createCompleter<AppConfig>();

const _appConfigFactory = registerAs(__NS_CONFIG_APP__, (): AppConfig => {
  const configFromFile: AppConfig = _isReadFromEnv
    ? _loadConfigFromEnvFile(_nodeEnv)
    : _loadConfigFromYamlFile(_nodeEnv);

  const schema = Joi.object<AppConfig, true>({
    port: Joi.number().min(1024).max(65535).required(),
    isAuthEnabled: Joi.boolean().required(),
    useModuleCats: Joi.boolean().required(),
  });

  const { error } = schema.validate(configFromFile, {
    allowUnknown: false,
    abortEarly: false,
  });

  if (error) {
    throw new Error(`Config validation error: ${error.message}`);
  }

  _appConfigCompleter.resolve(configFromFile);
  return configFromFile;
});

/* AppConfigType === AppConfig */
//export type AppConfigType = ConfigType<typeof _appConfigFactory>;

const _restOptionsForConfigModule = (): ConfigModuleOptions => {
  return _isReadFromEnv
    ? {
        envFilePath: `.env.${_nodeEnv}`,
        expandVariables: true,
        cache: true,
        skipProcessEnv: false,
        ignoreEnvFile: false,
      }
    : {
        skipProcessEnv: true,
        ignoreEnvFile: true,
      };
};

//@Global() // 🔥 核心：设为全局模块
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: false,
      load: [_appConfigFactory],
      ..._restOptionsForConfigModule(),
    }),
  ],
  providers: [
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      provide: AppEnvironment as any,
      useValue: _nodeEnv,
    } as ValueProvider<AppEnvironment>,
    {
      provide: AppConfig,
      useExisting: _appConfigFactory.KEY,
    } as ExistingProvider<AppConfig>,
    /* {
      provide: AppConfig,
      useFactory: (originalCfg: AppConfig) => originalCfg,
      inject: [_appConfigFactory.KEY],
    } as FactoryProvider, */
  ],
  exports: [AppEnvironment as any, AppConfig],
})
export class AppConfigModule {
  /**
   * This promise resolves when "dotenv" completes loading environment variables.
   * When "ignoreEnvFile" is set to true, then it will resolve immediately after the
   * "ConfigModule#forRoot" method is called.
   */
  static get _ensureEnvVariablesLoaded(): Promise<void> {
    //return _isReadFromEnv ? ConfigModule.envVariablesLoaded : Promise.resolve();
    return ConfigModule.envVariablesLoaded;
  }
}

export const useImport = async (
  createFn: (
    //appConfig: AppConfig,
    env: NodeJS.ProcessEnv,
  ) => Promise<DynamicModule>,
): Promise<DynamicModule> => {
  await AppConfigModule._ensureEnvVariablesLoaded;
  //const appConfig = await _appConfigCompleter.promise;
  return createFn(/* appConfig,  */ process.env);
};
