import { delay } from '../shared/deps/utils.ts';
import { initDb } from '../shared/db.ts';
import * as executor from '../shared/executor.ts';
import type { Logger } from '../shared/log.ts';
import config from '../shared/config.ts';
import * as reporter from './report.ts';

export async function run(logger: Logger, abortSignal: AbortSignal) {
  logger.info('Starting worker…');
  const db = await initDb(logger);
  while (!abortSignal.aborted) {
    try {
      logger.info('Retrieving ticket monitoring requests from database…');
      const requests = await db.getRequests();
      if (requests.length > 0) {
        logger.info(`Processing ${requests.length} ticket monitoring request(s)…`);
        for (const request of requests) {
          logger.info('--------------------------------------------');
          logger.info(`Processing request '${request.title}' with URL '${request.pageUrl}'…`);
          const result = await executor.executeRequest(request);
          switch (result.type) {
            case 'tickets-found':
              logger.info('Tickets found!');
              if (request.report) {
                await reporter.report(
                  `❗️❗️❗️ Tickets are available for '${request.title}'! Link: ${request.pageUrl}.`,
                  request.report
                );
              } else {
                logger.warn('Report options are not set');
              }
              logger.info(`Removing request '${request.title}' from database…`)
              await db.removeRequest(request);
              break;
            case 'tickets-not-found':
              logger.info('Tickets not found');
              break;
            case 'request-expired':
              logger.info(`Ticket monitoring request '${request.title}' has expired`);
              logger.info(`Removing request '${request.title}' from database…`);
              await db.removeRequest(request);
              break;
            case 'error':
              logger.error(result.details);
              break;
          }
        }
      } else {
        logger.info('No pending requests found');
      }
    } catch (e) {
      logger.error(e);
    } finally {
      logger.info('--------------------------------------------');
      logger.info(`Waiting ${config.retryIntervalMs}ms for next iteration…`);
      await delay(config.retryIntervalMs);
    }
  }
}
