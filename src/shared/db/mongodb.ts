import { DbError, type Db } from "../db.ts";
import { MongoClient, type Collection, type ObjectId } from "../deps/db.ts";
import { formatDate, parseDate } from "../deps/utils.ts";
import type { Logger } from "../log.ts";
import type {
  SearchCriteriaPreset,
  TicketMonitoringRequest,
} from "../model.ts";
import { retryAsync } from "../utils.ts";

type TicketMonitoringRequestSchema = {
  _id: ObjectId;
  expirationDate: string;
} & Omit<TicketMonitoringRequest, "expirationDate">;

type SearchCriteriaPresetSchema = {
  _id: ObjectId;
} & SearchCriteriaPreset;

class MongoDb implements Db {
  private _requests: Collection<TicketMonitoringRequestSchema>;
  private _presets: Collection<SearchCriteriaPresetSchema>;

  constructor(client: MongoClient) {
    const db = client.database();
    this._requests = db.collection<TicketMonitoringRequestSchema>(
      "ticket-monitoring-requests"
    );
    this._presets = db.collection<SearchCriteriaPresetSchema>(
      "search-criteria-presets"
    );
  }

  async getRequests(): Promise<TicketMonitoringRequest[]> {
    const requests = await this._requests.find({}).toArray();
    return requests.map((x) => requestEntityToModel(x));
  }

  async addRequest(request: TicketMonitoringRequest): Promise<void> {
    await this._requests.insertOne(requestModelToEntity(request));
  }

  async removeRequest(request: TicketMonitoringRequest): Promise<void> {
    await this._requests.deleteOne(requestModelToEntity(request));
  }

  async getPresets(): Promise<SearchCriteriaPreset[]> {
    const presets = await this._presets.find({}).toArray();
    return presets.map((x) => presetEntityToModel(x));
  }
}

export async function createDb(
  logger: Logger,
  connectionString: string
): Promise<Db> {
  try {
    return await retryAsync(
      async () => {
        logger.info(`Connecting to MongoDB…`);
        const client = new MongoClient();
        await client.connect(connectionString);
        return new MongoDb(client);
      },
      {
        attempts: 20,
        interval: 5000,
        logger: logger,
      }
    );
  } catch (e) {
    throw new DbError(`${e}`);
  }
}

function requestEntityToModel(
  entity: TicketMonitoringRequestSchema
): TicketMonitoringRequest {
  const { _id, expirationDate, ...rest } = entity;
  return { expirationDate: parseDate(expirationDate, "yyyy-MM-dd"), ...rest };
}

function requestModelToEntity(
  model: TicketMonitoringRequest
): Omit<TicketMonitoringRequestSchema, "_id"> {
  const { expirationDate, ...rest } = model;
  return { expirationDate: formatDate(expirationDate, "yyyy-MM-dd"), ...rest };
}

function presetEntityToModel(
  entity: SearchCriteriaPresetSchema
): SearchCriteriaPreset {
  const { _id, ...rest } = entity;
  return rest;
}
