import { type ObjectId, MongoClient } from '../../shared/deps/db.ts';
import { joinPath } from '../../shared/deps/utils.ts';
import { DbError } from '../../shared/db.ts';
import type { Logger } from '../../shared/log.ts';
import { retryAsync } from '../../shared/utils.ts';
import { Migrator } from '../migrator.ts';

interface MigrationSchema {
  _id: ObjectId;
  fileName: string;
  dateUnixMs: number;
}

class MongoDbMigrator implements Migrator {

  constructor(
    private logger: Logger,
    private client: MongoClient,
    private migrationsFolderPath: string
  ) { }

  async runMigrations(): Promise<void> {
    try {
      this.logger.info(`Running MongoDB migrations from folder '${this.migrationsFolderPath}'…`);
      const db = this.client.database('ticket-monitor');
      const migrationsCollection = db.collection<MigrationSchema>('migrations');
      const migrations = await migrationsCollection.find({}).toArray();
      const migrationsDir = Deno.readDir(this.migrationsFolderPath);
      const migrationFiles: Deno.DirEntry[] = [];
      for await (const migrationFile of migrationsDir) {
        if (migrationFile.isFile) {
          migrationFiles.push(migrationFile);
        }
      }
      const pendingMigrationFiles = migrationFiles.filter(mf => !migrations.some(m => m.fileName === mf.name));
      if (pendingMigrationFiles.length === 0) {
        this.logger.info('No pending migrations found');
        return;
      }
      this.logger.info(`Discovered ${pendingMigrationFiles.length} pending migration(s)`);
      pendingMigrationFiles.sort();
      for (const pendingMigrationFile of pendingMigrationFiles) {
        if (migrations.some(x => x.fileName === pendingMigrationFile.name)) {
          this.logger.info(`Skipping migration file '${pendingMigrationFile.name}' because it's already applied.`);
          continue;
        }
        const migration = await import(`${joinPath(
          Deno.cwd(),
          this.migrationsFolderPath,
          pendingMigrationFile.name)}`
        );
        if (!migration['up']) {
          this.logger.warn(`Skipping migration file '${pendingMigrationFile.name}' because it lacks the 'up' function.`);
          continue;
        }
        this.logger.info(`Applying migrations from file '${pendingMigrationFile.name}'…`);
        migration['up'](this.client);
        await migrationsCollection.insertOne({
          fileName: pendingMigrationFile.name,
          dateUnixMs: Date.now()
        });
      }
      this.logger.info('All migrations have been successfully applied');
    } catch (e) {
      throw new DbError(`There was a problem running MongoDB migrations: ${e}`);
    }
  }

}

export async function createMigrator(
  logger: Logger,
  connectionString: string,
  migrationsFolderPath: string
): Promise<Migrator> {
  try {
    return await retryAsync(async () => {
      logger.info('Connecting to MongoDB…');
      const client = new MongoClient();
      await client.connect(connectionString);
      return new MongoDbMigrator(logger, client, migrationsFolderPath);
    }, {
      attempts: 20,
      interval: 5000,
      logger: logger
    });
  } catch (e) {
    throw new DbError(`${e}`);
  }
}
