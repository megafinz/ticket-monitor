import { config } from './deps/config.ts';
import * as log from './log.ts';

config({
  path: '.local.env',
  export: true
});

class ConfigError extends Error {
  constructor(msg: string) {
    super(`[ConfigError]: ${msg}`);
    Object.setPrototypeOf(this, ConfigError.prototype);
  }
}

export interface ConfigValues {
  dbType?: string;
  mongoDbConnectionString?: string;
  retryIntervalMs?: string;
  apiKey?: string;
  port?: string;
  telegramBotToken?: string;
}

export type DbConfig = {
  type: 'mongodb';
  connectionString: string;
  migrationsFolderPath: string;
} | {
  type: 'in-memory'
};

const logger = new log.ConsoleLogger('Configuration');

const configValues: ConfigValues = {
  dbType: Deno.env.get('DB_TYPE'),
  mongoDbConnectionString: Deno.env.get('MONGO_DB_CONNECTION_STRING'),
  retryIntervalMs: Deno.env.get('RETRY_INTERVAL_MS'),
  apiKey: Deno.env.get('API_KEY'),
  port: Deno.env.get('PORT'),
  telegramBotToken: Deno.env.get('TG_BOT_TOKEN')
};

export interface ConfigValidationResult {
  infos: string[];
  warns: string[];
  errors: string[];
}

export function configSection<T>(
  create: (configValues: ConfigValues) => T,
  validate?: (configValues: ConfigValues) => ConfigValidationResult
): T {
  let validationResult: ConfigValidationResult | undefined;

  if (validate) {
    validationResult = validate(configValues);
  }

  if (validationResult) {
    if (validationResult.errors.length > 0) {
      for (const error of validationResult.errors) {
        logger.error(error);
      }
      throw new ConfigError('Configuration is invalid');
    }

    for (const warn of validationResult.warns) {
      logger.warn(warn);
    }

    for (const info of validationResult.infos) {
      logger.info(info);
    }
  }

  return create(configValues);
}

function createDbConfig(cfg: ConfigValues): DbConfig {
  return cfg.dbType === 'mongodb' ? {
    type: 'mongodb',
    connectionString: configValues.mongoDbConnectionString!,
    migrationsFolderPath: 'migrations/mongodb'
  } : {
    type: 'in-memory'
  };
}

function validateDbConfig(cfg: ConfigValues) {
  const infos: string[] = [];
  const warns: string[] = [];
  const errors: string[] = [];

  if (!cfg.dbType) {
    infos.push('DB_TYPE is not set. Allowed values: \'mongodb\', \'in-memory\'. Defaulting to \'in-memory\'.');
    cfg.dbType = 'in-memory';
  } else if (cfg.dbType !== 'mongodb' && cfg.dbType !== 'in-memory') {
    warns.push(`Unrecognized DB_TYPE: '${cfg.dbType}'. Allowed values: 'mongodb', 'in-memory'. Defaulting to 'in-memory'.`)
    cfg.dbType = 'in-memory';
  }

  if (cfg.dbType === 'mongodb' && !cfg.mongoDbConnectionString) {
    errors.push('MONGO_DB_CONECTION_STRING is required when DB_TYPE is set to \'mongodb\'');
  }

  return { infos, warns, errors };
}

export const dbConfig: DbConfig = configSection(createDbConfig, validateDbConfig);
