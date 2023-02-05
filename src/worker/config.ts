import {
  configSection,
  dbConfig,
  type ConfigValues,
  type DbConfig,
} from "../shared/config.ts";

export interface Config {
  db: DbConfig;
  worker: {
    retryIntervalMs: number;
    report: {
      telegram?: {
        botToken: string;
      };
    };
  };
}

const cfg: Config = {
  db: dbConfig,
  worker: configSection(createWorkerConfig, validateWorkerConfig),
};

function createWorkerConfig(cfg: ConfigValues) {
  return {
    retryIntervalMs: parseInt(cfg.retryIntervalMs!),
    report: {
      telegram: cfg.telegramBotToken
        ? { botToken: cfg.telegramBotToken }
        : undefined,
    },
  };
}

function validateWorkerConfig(cfg: ConfigValues) {
  const infos: string[] = [];
  const warns: string[] = [];

  if (!cfg.retryIntervalMs) {
    infos.push("RETRY_INTERVAL_MS is not set. Defaulting to 60000.");
    cfg.retryIntervalMs = "60000";
  }

  if (!cfg.telegramBotToken) {
    warns.push("No reporting settings are set (missing TG_BOT_TOKEN).");
  }

  return { infos, warns, errors: [] };
}

export default cfg;
