import type { Logger } from '../shared/log.ts';
import { createMigrator } from './migrator/mongodb.ts';
import config from './config.ts';

export interface Migrator {
  runMigrations(): Promise<void>;
}

export async function run(logger: Logger) {
  let migrator: Migrator | undefined;

  if (config.db.type === 'mongodb') {
    migrator = await createMigrator(logger, config.db.connectionString, config.db.migrationsFolderPath);
  }

  if (migrator) {
    await migrator.runMigrations();
  } else {
    logger.info(`No migrator defined for database type '${config.db.type}', skipping.`);
  }
}
