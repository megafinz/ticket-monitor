export type SearchCriteria = {
  type: 'css-selector';
  selector: string;
  child?: SearchCriteria;
} | {
  type: 'node-name';
  nodeName: string;
  child?: SearchCriteria
}

export type Report = {
  type: 'telegram',
  chatId: string
}

export interface TicketMonitoringRequest {
  description: string,
  pageUrl: string,
  searchCriteria: SearchCriteria,
  expirationDate: Date,
  report: Report
}
