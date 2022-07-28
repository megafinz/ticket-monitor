import { config } from './deps/config.ts';

config({
  path: '.local.env',
  export: true
});

export interface Config {
  db: {
    type: 'mongodb';
    connectionString: string;
    migrationsFolderPath: string;
  };
  retryIntervalMs: number;
  api: {
    key: string;
    port: number;
  },
  report?: {
    telegram?: {
      botToken: string
    };
  }
}

const cfg : Config = {
  db: {
    type: 'mongodb',
    connectionString: Deno.env.get('MONGO_DB_CONNECTION_STRING') || '',
    migrationsFolderPath: 'migrations/mongodb'
  },
  retryIntervalMs: parseInt(Deno.env.get('RETRY_INTERVAL_MS') || '60000'),
  report: {
    telegram: {
      botToken: Deno.env.get('TG_BOT_TOKEN') || ''
    }
  },
  api: {
    key: Deno.env.get('API_KEY') || '',
    port: parseInt(Deno.env.get('PORT') || '80')
  }
};

export default cfg;
