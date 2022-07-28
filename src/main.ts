import { initMigrator } from './db.ts';
import * as worker from './worker.ts';
import * as api from './api.ts';
import * as log from './log.ts';
import { ReportSettings } from './model.ts';

function createTicketMonitorRequestLogger(report: ReportSettings | undefined) {
  return report
    ? new log.CompositeLogger([
        new log.ConsoleLogger('Worker -> Ticket Monitor'),
        new log.TgLogger(report.chatId)
      ])
    : new log.ConsoleLogger('Worker -> Ticket Monitor');
}

const migratorLogger = new log.ConsoleLogger('Migrator');
const workerLogger = new log.ConsoleLogger('Worker');
const apiLogger = new log.ConsoleLogger('API');

const migrator = await initMigrator(migratorLogger);
await migrator.runMigrations();

const workerPromise = worker.run(workerLogger, createTicketMonitorRequestLogger);
const apiPromise = api.run(apiLogger);

await Promise.all([workerPromise, apiPromise]);
