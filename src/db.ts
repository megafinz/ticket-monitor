import config from './config.ts';
import { SearchCriteriaPreset, TicketMonitoringRequest } from './model.ts';
import { AsyncLogger } from './log.ts';
import { createDb } from './db/mongodb/db.ts';
import { createMigrator } from './db/mongodb/db.migrator.ts';

export interface Db {
  getRequests(): Promise<TicketMonitoringRequest[]>;
  addRequest(request: TicketMonitoringRequest): Promise<void>;
  removeRequest(request: TicketMonitoringRequest): Promise<void>;
  getPresets(): Promise<SearchCriteriaPreset[]>;
}

export interface Migrator {
  runMigrations(): Promise<void>;
}

export class DbError extends Error {
  constructor(msg: string) {
    super(`[DbError]: ${msg}`);
    Object.setPrototypeOf(this, DbError.prototype);
  }
}

class ErrorWrappingDb implements Db {
  constructor(private db: Db) { }

  async getRequests(): Promise<TicketMonitoringRequest[]> {
    try {
      return await this.db.getRequests();
    } catch (e) {
      throw new DbError(`${e}`);
    }
  }

  async addRequest(request: TicketMonitoringRequest): Promise<void> {
    try {
      return await this.db.addRequest(request);
    } catch (e) {
      throw new DbError(`${e}`);
    }
  }

  async removeRequest(request: TicketMonitoringRequest): Promise<void> {
    try {
      return await this.db.removeRequest(request);
    } catch (e) {
      throw new DbError(`${e}`);
    }
  }

  async getPresets(): Promise<SearchCriteriaPreset[]> {
    try {
      return await this.db.getPresets();
    } catch (e) {
      throw new DbError(`${e}`);
    }
  }
}

let db: Promise<Db>;

export function initDb(logger: AsyncLogger): Promise<Db> {
  logger.info('Initializing database…');

  if (db) {
    logger.info('Database is already initialized');
    return db;
  }

  if (config.db.type === 'mongodb') {
    logger.info('Initializing MongoDB client…');
    db = createDb(logger, config.db.connectionString).then(x => new ErrorWrappingDb(x));
  } else {
    throw new Error(`Unsupported DB type: ${config.db.type}`);
  }

  return db;
}

export async function initMigrator(logger: AsyncLogger): Promise<Migrator> {
  if (config.db.type === 'mongodb') {
    return await createMigrator(logger, config.db.connectionString, config.db.migrationsFolderPath);
  }

  throw new Error(`Unsupported DB type: ${config.db.type}`);
}
