import { Module, Injectable, Inject } from '@nestjs/common';
import { registerAs, ConfigModule, ConfigModuleOptions } from '@nestjs/config';
import { type ConfigType } from '@nestjs/config';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as yaml from 'js-yaml';
import * as Joi from 'joi';

const _isReadFromEnv = true;

const __NS_CONFIG_APP__ = '__NS_CONFIG_APP__';

const __APP_ENVIRONMENTS__ = [
  'development',
  'production',
  'test',
  'provision',
] as const;

export type AppEnvironment = (typeof __APP_ENVIRONMENTS__)[number];

interface _EnvFileFormat {
  PORT: number;
  AUTH_ENABLED: boolean;
}

interface _YamlFileFormat {
  http: {
    port: number;
  };
  auth: {
    isEnabled: boolean;
  };
}

interface _AppConfig {
  nodeEnv: AppEnvironment;
  port: number;
  isAuthEnabled: boolean;
}

const _loadConfigFromEnvFile = (
  env: AppEnvironment,
): Omit<_AppConfig, 'nodeEnv'> => {
  console.log(`_loadConfigFromEnvFile nodeEnv = ${env}`);

  const cfgFromEnvFile = process.env as unknown as _EnvFileFormat;

  const schema = Joi.object<_EnvFileFormat, true>({
    PORT: Joi.number().required(),
    AUTH_ENABLED: Joi.boolean().required(),
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
  };
};

const _loadConfigFromYamlFile = (
  env: AppEnvironment,
): Omit<_AppConfig, 'nodeEnv'> => {
  console.log(`_loadConfigFromYaml nodeEnv = ${process.env.NODE_ENV}`);

  const YAML_CONFIG_FILENAME = `app.config.${env}.yaml`;
  const cfgFromYamlFile = yaml.load(
    readFileSync(join(__dirname, YAML_CONFIG_FILENAME), 'utf8'),
  ) as _YamlFileFormat;

  return {
    port: cfgFromYamlFile.http.port,
    isAuthEnabled: cfgFromYamlFile.auth.isEnabled,
  };
};

const _appConfiguration = registerAs(__NS_CONFIG_APP__, (): _AppConfig => {
  const schemaForNodeEnv = Joi.string<AppEnvironment>()
    .valid(...__APP_ENVIRONMENTS__)
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

  const configFromFile = _isReadFromEnv
    ? _loadConfigFromEnvFile(nodeEnv)
    : _loadConfigFromYamlFile(nodeEnv);

  const schema = Joi.object<Omit<_AppConfig, 'nodeEnv'>, true>({
    port: Joi.number().min(1024).max(49151).required(),
    isAuthEnabled: Joi.boolean().required(),
  });

  const { error } = schema.validate(configFromFile, {
    allowUnknown: false,
    abortEarly: false,
  });

  if (error) {
    throw new Error(`Config validation error: ${error.message}`);
  }

  return {
    nodeEnv,
    ...configFromFile,
  };
});

@Injectable()
export class AppConfigService {
  constructor(
    @Inject(_appConfiguration.KEY)
    private readonly appConfig: ConfigType<typeof _appConfiguration>,
  ) {}

  get nodeEnv(): AppEnvironment {
    return this.appConfig.nodeEnv;
  }

  get port(): number {
    return this.appConfig.port;
  }

  get isAuthEnabled(): boolean {
    return this.appConfig.isAuthEnabled;
  }
}

const _configForConfigModule = (): ConfigModuleOptions => {
  console.log(
    `_configForConfigModule process.env.NODE_ENV = ${process.env.NODE_ENV}`,
  );
  const env = (process.env.NODE_ENV as AppEnvironment) || 'unknown';
  return _isReadFromEnv
    ? {
        envFilePath: `.env.${env}`,
        validatePredefined: true,
        validationSchema: Joi.object({
          NODE_ENV: Joi.string()
            .valid(...__APP_ENVIRONMENTS__)
            .required(),
        }),
        validationOptions: {
          allowUnknown: true,
          abortEarly: true,
        },
        expandVariables: true,
        cache: true,
        skipProcessEnv: false,
        ignoreEnvFile: false,
      }
    : {
        envFilePath: `.env.${env}`,
        validatePredefined: true,
        validationSchema: Joi.object({
          NODE_ENV: Joi.string()
            .valid(...__APP_ENVIRONMENTS__)
            .required(),
        }),
        validationOptions: {
          allowUnknown: true,
          abortEarly: true,
        },
        skipProcessEnv: true,
        ignoreEnvFile: false,
      };
};

//@Global() // 🔥 核心：设为全局模块
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: false,
      load: [_appConfiguration],
      ..._configForConfigModule(),
    }),
  ],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AppConfigModule {}
