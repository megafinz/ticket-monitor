import config from './config.ts';
import { TicketMonitoringRequest } from './model.ts';
import { createDb } from './db/db.mongodb.ts';
import { AsyncLogger } from "./log.ts";

export interface Db {
  getAll(): Promise<TicketMonitoringRequest[]>;
  add(request: TicketMonitoringRequest): Promise<void>;
  remove(request: TicketMonitoringRequest): Promise<void>;
}

export class DbError extends Error {
  constructor(msg: string) {
    super(msg);
    Object.setPrototypeOf(this, DbError.prototype);
  }
}

class ErrorWrappingDb implements Db {
  constructor(private db: Db) { }

  getAll(): Promise<TicketMonitoringRequest[]> {
    try {
      return this.db.getAll();
    } catch (e) {
      throw new DbError(`[DbError]: ${e}`);
    }
  }

  add(request: TicketMonitoringRequest): Promise<void> {
    try {
      return this.db.add(request);
    } catch (e) {
      throw new DbError(`[DbError]: ${e}`);
    }
  }

  remove(request: TicketMonitoringRequest): Promise<void> {
    try {
      return this.db.remove(request);
    } catch (e) {
      throw new DbError(`[DbError]: ${e}`);
    }
  }
}

let db: Promise<Db>;

export function initDb(logger: AsyncLogger): Promise<Db> {
  if (db) {
    return db;
  }

  if (config.db.type === 'mongodb') {
    db = createDb(logger, config.db.connectionString).then(x => new ErrorWrappingDb(x));
  }

  return db;
}
