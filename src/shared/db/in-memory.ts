import { Db } from "../db.ts";
import { SearchCriteriaPreset, TicketMonitoringRequest } from "../model.ts";

class InMemoryDb implements Db {
  private _requests: TicketMonitoringRequest[] = [];
  private _presets: SearchCriteriaPreset[] = [];

  getRequests(): Promise<TicketMonitoringRequest[]> {
    return Promise.resolve(this._requests);
  }

  addRequest(request: TicketMonitoringRequest): Promise<void> {
    this._requests.push(request);
    return Promise.resolve();
  }

  removeRequest(request: TicketMonitoringRequest): Promise<void> {
    // TODO: introduce ids into models?
    this._requests = this._requests.filter((x) => x.title === request.title);
    return Promise.resolve();
  }

  getPresets(): Promise<SearchCriteriaPreset[]> {
    return Promise.resolve(this._presets);
  }
}

export function createDb(): Promise<Db> {
  return Promise.resolve(new InMemoryDb());
}
