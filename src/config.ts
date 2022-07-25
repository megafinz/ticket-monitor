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
  telegram: {
    botToken: string
  };
  api: {
    key: string;
    port: number;
  }
}

const cfg : Config = {
  db: {
    type: 'mongodb',
    connectionString: Deno.env.get('MONGO_DB_CONNECTION_STRING') || '',
    migrationsFolderPath: 'migrations/mongodb'
  },
  retryIntervalMs: parseInt(Deno.env.get('RETRY_INTERVAL_MS') || '60000'),
  telegram: {
    botToken: Deno.env.get('TG_BOT_TOKEN') || ''
  },
  api: {
    key: Deno.env.get('API_KEY') || '',
    port: parseInt(Deno.env.get('API_PORT') || '0')
  }
};

export default cfg;
