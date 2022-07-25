import { delay, formatDate, parseDate } from '../deps/utils.ts';
import { Collection, MongoClient, MongoDriverError, ObjectId } from '../deps/db.ts';
import type { Db } from '../db.ts';
import type { TicketMonitoringRequest } from '../model.ts';
import { AsyncLogger } from "../log.ts";

type TicketMonitoringRequestSchema = {
  _id: ObjectId;
  expirationDate: string;
} & Omit<TicketMonitoringRequest, 'expirationDate'>;

class MongoDb implements Db {

  private _requests: Collection<TicketMonitoringRequestSchema>;

  constructor(client: MongoClient) {
    const db = client.database();
    this._requests = db.collection<TicketMonitoringRequestSchema>('ticket-monitoring-requests');
  }

  async getAll(): Promise<TicketMonitoringRequest[]> {
    const requests = await this._requests.find({}).toArray();
    return requests.map(x => entityToModel(x));
  }

  async add(request: TicketMonitoringRequest): Promise<void> {
    await this._requests.insertOne(modelToEntity(request));
  }

  async remove(request: TicketMonitoringRequest): Promise<void> {
    await this._requests.deleteOne(modelToEntity(request));
  }
}

export async function createDb(logger: AsyncLogger, connectionString: string): Promise<Db> {
  try {
    const client = new MongoClient();
    await client.connect(connectionString);
    return new MongoDb(client);
  } catch (e) {
    if (e instanceof MongoDriverError) {
      await logger.warn(`There was a problem connecting to MongoDB: ${e}`);
      await logger.info('Waiting 5000ms to retry…');
      await delay(5000);
      return createDb(logger, connectionString);
    } else {
      throw e;
    }
  }
}

function entityToModel(entity: TicketMonitoringRequestSchema): TicketMonitoringRequest {
  const { _id, expirationDate, ...rest } = entity;
  return { expirationDate: parseDate(expirationDate, 'yyyy-MM-dd'),...rest };
}

function modelToEntity(model: TicketMonitoringRequest): Omit<TicketMonitoringRequestSchema, '_id'> {
  const { expirationDate, ...rest } = model;
  return { expirationDate: formatDate(expirationDate, 'yyyy-MM-dd'), ...rest };
}
