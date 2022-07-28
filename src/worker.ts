import { delay } from './deps/utils.ts';
import type { AsyncLogger } from './log.ts';
import { initDb } from './db.ts';
import * as executor from './executor.ts';
import config from './config.ts';
import type { ReportSettings } from './model.ts';

export async function run(
  mainLogger: AsyncLogger,
  monitoringRequestLoggerFactory: (report: ReportSettings | undefined) => AsyncLogger
) {
  await mainLogger.info('Starting worker…');
  const db = await initDb(mainLogger);
  while (true) {
    try {
      await mainLogger.info('Retrieving ticket monitoring requests from database…');
      const requests = await db.getRequests();
      if (requests.length > 0) {
        await mainLogger.info(`Processing ${requests.length} ticket monitoring request(s)…`);
        for (const request of requests) {
          const requestLogger = monitoringRequestLoggerFactory(request.report);
          await requestLogger.info('--------------------------------------------');
          await requestLogger.info(`Processing request '${request.title}' with URL '${request.pageUrl}'…`);
          const result = await executor.executeRequest(request);
          switch (result.type) {
            case 'tickets-found':
              await requestLogger.important(`Tickets are available for '${request.title}'! Link: ${request.pageUrl}.`);
              await mainLogger.info(`Removing request '${request.title}' from database…`)
              await db.removeRequest(request);
              break;
            case 'tickets-not-found':
              await requestLogger.info('Tickets not found');
              break;
            case 'request-expired':
              await requestLogger.info(`Ticket monitoring request '${request.title}' has expired`);
              await mainLogger.info(`Removing request '${request.title}' from database…`);
              await db.removeRequest(request);
              break;
            case 'error':
              await mainLogger.error(result.details);
              break;
          }
        }
      } else {
        await mainLogger.info('No pending requests found');
      }
    } catch (e) {
      mainLogger.error(e);
    } finally {
      await mainLogger.info('--------------------------------------------');
      await mainLogger.info(`Waiting ${config.retryIntervalMs}ms for next iteration…`);
      await delay(config.retryIntervalMs);
    }
  }
}
