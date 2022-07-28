import config from '../shared/config.ts';
import type { Logger } from '../shared/log.ts';
import { createMigrator } from './migrator/mongodb.ts';

export interface Migrator {
  runMigrations(): Promise<void>;
}

export async function run(logger: Logger) {
  let migrator: Migrator;

  if (config.db.type === 'mongodb') {
    migrator = await createMigrator(logger, config.db.connectionString, config.db.migrationsFolderPath);
  } else {
    throw new Error(`Unsupported DB type: ${config.db.type}`);
  }

  await migrator.runMigrations();
}
