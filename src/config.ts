import { config } from './deps.ts';

config({ export: true });

export interface Config {
  db: {
    type: 'mongodb';
    connectionString: string;
  };
  retryIntervalMs: number;
  telegram: {
    botToken: string
  };
}

const cfg : Config = {
  db: {
    type: 'mongodb',
    connectionString: Deno.env.get('MONGO_DB_CONNECTION_STRING') || ''
  },
  retryIntervalMs: parseInt(Deno.env.get('RETRY_INTERVAL_MS') || '60000'),
  telegram: {
    botToken: Deno.env.get('TG_BOT_TOKEN') || ''
  }
};

export default cfg;
