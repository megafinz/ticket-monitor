import { ReportSettings } from '../shared/model.ts';
import * as log from '../shared/log.ts';
import * as worker from './worker.ts';

const workerLogger = new log.ConsoleLogger('Worker');

function createTicketMonitorRequestLogger(report: ReportSettings | undefined): log.AsyncLogger {
  return report
    ? new log.CompositeLogger([
        new log.ConsoleLogger('Worker -> Ticket Monitor'),
        new log.TgLogger(report.chatId)
      ])
    : new log.ConsoleLogger('Worker -> Ticket Monitor');
}

await worker.run(workerLogger, createTicketMonitorRequestLogger);
