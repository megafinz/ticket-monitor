import { dbConfig } from './config.ts';
import type { SearchCriteriaPreset, TicketMonitoringRequest } from './model.ts';
import type { Logger } from './log.ts';
import { retryAsync } from './utils.ts';
import * as mongoDb from './db/mongodb.ts';
import * as inMemoryDb from './db/in-memory.ts';

export interface Db {
  getRequests(): Promise<TicketMonitoringRequest[]>;
  addRequest(request: TicketMonitoringRequest): Promise<void>;
  removeRequest(request: TicketMonitoringRequest): Promise<void>;
  getPresets(): Promise<SearchCriteriaPreset[]>;
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
      return await retryAsync(async () => await this.db.getRequests());
    } catch (e) {
      throw new DbError(`${e}`);
    }
  }

  async addRequest(request: TicketMonitoringRequest): Promise<void> {
    try {
      return await retryAsync(async () => await this.db.addRequest(request));
    } catch (e) {
      throw new DbError(`${e}`);
    }
  }

  async removeRequest(request: TicketMonitoringRequest): Promise<void> {
    try {
      return await retryAsync(async () => await this.db.removeRequest(request));
    } catch (e) {
      throw new DbError(`${e}`);
    }
  }

  async getPresets(): Promise<SearchCriteriaPreset[]> {
    try {
      return await retryAsync(async () => await this.db.getPresets());
    } catch (e) {
      throw new DbError(`${e}`);
    }
  }
}

let db: Promise<Db>;

export function initDb(logger: Logger): Promise<Db> {
  logger.info('Initializing database…');

  if (db) {
    logger.info('Database is already initialized');
    return db;
  }

  if (dbConfig.type === 'mongodb') {
    logger.info('Initializing MongoDB database…');
    db = mongoDb.createDb(logger, dbConfig.connectionString).then(x => new ErrorWrappingDb(x));
  } else if (dbConfig.type === 'in-memory') {
    logger.info('Initializing in-memory database…');
    db = inMemoryDb.createDb();
  } else {
    throw new Error(`Unsupported DB type`);
  }

  return db;
}
