import { MongoClient, MongoDriverError, ObjectId } from '../../deps/db.ts';
import { delay, joinPath } from '../../deps/utils.ts';
import { DbError, Migrator } from '../../db.ts';
import { AsyncLogger } from '../../log.ts';

interface MigrationSchema {
  _id: ObjectId;
  fileName: string;
  dateUnixMs: number;
}

class MongoDbMigrator implements Migrator {

  constructor(
    private logger: AsyncLogger,
    private client: MongoClient,
    private migrationsFolderPath: string
  ) { }

  async runMigrations(): Promise<void> {
    try {
      await this.logger.info(`Running MongoDB migrations from folder '${this.migrationsFolderPath}'…`);
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
        await this.logger.info('No pending migrations found');
        return;
      }
      await this.logger.info(`Discovered ${pendingMigrationFiles.length} pending migration(s)`);
      pendingMigrationFiles.sort();
      for (const pendingMigrationFile of pendingMigrationFiles) {
        if (migrations.some(x => x.fileName === pendingMigrationFile.name)) {
          await this.logger.info(`Skipping migration file '${pendingMigrationFile.name}' because it's already applied.`);
          continue;
        }
        const migration = await import(`${joinPath(
          Deno.cwd(),
          this.migrationsFolderPath,
          pendingMigrationFile.name)}`
        );
        if (!migration['up']) {
          await this.logger.warn(`Skipping migration file '${pendingMigrationFile.name}' because it lacks the 'up' function.`);
          continue;
        }
        await this.logger.info(`Applying migrations from file '${pendingMigrationFile.name}'…`);
        migration['up'](this.client);
        await migrationsCollection.insertOne({
          fileName: pendingMigrationFile.name,
          dateUnixMs: Date.now()
        });
      }
      await this.logger.info('All migrations have been successfully applied');
    } catch (e) {
      throw new DbError(`There was a problem running MongoDB migrations: ${e}`);
    }
  }

}

export async function createMigrator(
  logger: AsyncLogger,
  connectionString: string,
  migrationsFolderPath: string
): Promise<Migrator> {
  try {
    const client = new MongoClient();
    await client.connect(connectionString);
    return new MongoDbMigrator(logger, client, migrationsFolderPath);
  } catch (e) {
    if (e instanceof MongoDriverError) {
      await logger.warn(`There was a problem connecting to MongoDB: ${e}`);
      await logger.info('Waiting 5000ms to retry…');
      await delay(5000);
      return createMigrator(logger, connectionString, migrationsFolderPath);
    } else {
      throw new DbError(`${e}`);
    }
  }
}
