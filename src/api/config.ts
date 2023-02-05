import {
  configSection,
  dbConfig,
  type ConfigValues,
  type DbConfig,
} from "../shared/config.ts";

export interface Config {
  db: DbConfig;
  api: {
    key: string;
    port: number;
    cors?: {
      origins?: string[];
    };
  };
}

const cfg: Config = {
  db: dbConfig,
  api: configSection(createApiConfig, validateApiConfig),
};

function createApiConfig(cfg: ConfigValues) {
  return {
    key: cfg.apiKey!,
    port: parseInt(cfg.port!),
    cors: cfg.corsOrigins
      ? {
          origins: cfg.corsOrigins.split(","),
        }
      : undefined,
  };
}

function validateApiConfig(cfg: ConfigValues) {
  const infos: string[] = [];
  const errors: string[] = [];

  if (!cfg.apiKey) {
    errors.push("API_KEY is required");
  }

  if (!cfg.port) {
    infos.push("PORT is not set. Defaulting to 80.");
    cfg.port = "80";
  }

  if (!cfg.corsOrigins) {
    infos.push("CORS_ORIGINS is not set");
  }

  return { infos, warns: [], errors };
}

export default cfg;
