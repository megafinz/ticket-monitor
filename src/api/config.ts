import { type DbConfig, type ConfigValues, configSection, dbConfig } from '../shared/config.ts';

export interface Config {
  db: DbConfig;
  api: {
    key: string,
    port: number
  };
}

const cfg: Config = {
  db: dbConfig,
  api: configSection(createApiConfig, validateApiConfig)
};

function createApiConfig(cfg: ConfigValues) {
  return {
    key: cfg.apiKey!,
    port: parseInt(cfg.port!)
  };
}

function validateApiConfig(cfg: ConfigValues) {
  const infos: string[] = [];
  const errors: string[] = [];

  if (!cfg.apiKey) {
    errors.push('API_KEY is required');
  }

  if (!cfg.port) {
    infos.push('PORT is not set. Defaulting to 80.');
    cfg.port = '80';
  }

  return { infos, warns: [], errors };
}

export default cfg;
