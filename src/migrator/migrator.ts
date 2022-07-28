import config from '../shared/config.ts';
import type { AsyncLogger } from '../shared/log.ts';
import { createMigrator } from './mongodb/migrator.ts';

export interface Migrator {
  runMigrations(): Promise<void>;
}

export async function run(logger: AsyncLogger) {
  let migrator: Migrator;

  if (config.db.type === 'mongodb') {
    migrator = await createMigrator(logger, config.db.connectionString, config.db.migrationsFolderPath);
  } else {
    throw new Error(`Unsupported DB type: ${config.db.type}`);
  }

  await migrator.runMigrations();
}
