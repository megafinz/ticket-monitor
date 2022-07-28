export type SearchCriteria = {
  type: 'css-selector';
  selector: string;
  child?: SearchCriteria;
} | {
  type: 'node-name';
  nodeName: string;
  child?: SearchCriteria
}

export type ReportOptions = {
  type: 'telegram',
  chatId: string
}

export interface TicketMonitoringRequest {
  title: string,
  pageUrl: string,
  searchCriteria: SearchCriteria,
  expirationDate: Date,
  report?: ReportOptions
}

export interface SearchCriteriaPreset {
  title: string,
  searchCriteria: SearchCriteria
}

export type TicketMonitoringRequestDto = Omit<TicketMonitoringRequest, 'expirationDate'> & {
  expirationDate: string
}
