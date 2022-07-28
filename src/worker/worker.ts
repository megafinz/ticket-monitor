import { delay } from '../shared/deps/utils.ts';
import type { ReportSettings } from '../shared/model.ts';
import { initDb } from '../shared/db.ts';
import * as executor from '../shared/executor.ts';
import type { AsyncLogger } from '../shared/log.ts';
import config from '../shared/config.ts';

type RequestLoggerFactory = (report: ReportSettings | undefined) => AsyncLogger;

export async function run(
  mainLogger: AsyncLogger,
  requestLoggerFactory: RequestLoggerFactory,
  abortSignal: AbortSignal
) {
  await mainLogger.info('Starting worker…');
  const db = await initDb(mainLogger);

  while (!abortSignal.aborted) {
    try {
      await mainLogger.info('Retrieving ticket monitoring requests from database…');
      const requests = await db.getRequests();
      if (requests.length > 0) {
        await mainLogger.info(`Processing ${requests.length} ticket monitoring request(s)…`);
        for (const request of requests) {
          const requestLogger = requestLoggerFactory(request.report);
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
