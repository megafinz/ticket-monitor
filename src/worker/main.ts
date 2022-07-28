import { ReportSettings } from '../shared/model.ts';
import * as log from '../shared/log.ts';
import * as worker from './worker.ts';

const logger = new log.ConsoleLogger('Worker');
const abortController = new AbortController();

Deno.addSignalListener('SIGTERM', () => {
  logger.info('Received SIGTERM signal, stopping the worker…');
  abortController.abort();
});

function createTicketMonitorRequestLogger(report: ReportSettings | undefined): log.AsyncLogger {
  return report
    ? new log.CompositeLogger([
        new log.ConsoleLogger('Worker -> Ticket Monitor'),
        new log.TgLogger(report.chatId)
      ])
    : new log.ConsoleLogger('Worker -> Ticket Monitor');
}

await worker.run(logger, createTicketMonitorRequestLogger, abortController.signal);
await logger.info('Worker finished running');
