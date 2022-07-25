import { delay } from './deps/utils.ts';
import { DOMParser } from './deps/html.ts';
import { AsyncLogger } from './log.ts';
import { initDb } from './db.ts';
import * as search from './search.ts';
import config from './config.ts';
import { ReportSettings } from './model.ts';

const domParser = new DOMParser();

export async function run(
  mainLogger: AsyncLogger,
  monitoringRequestLoggerFactory: (report: ReportSettings) => AsyncLogger
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
          await requestLogger.info(`Processing request '${request.title}'…`);
          await requestLogger.info(`Requesting '${request.pageUrl}'…`);
          const response = await fetch(request.pageUrl);
          if (response.status !== 200) {
            await requestLogger.error(`Request failed with status code ${response.status}`);
          } else {
            await requestLogger.info('Parsing the DOM…');
            const html = await response.text();
            const dom = domParser.parseFromString(html, 'text/html');
            if (!dom) {
              await requestLogger.error(`Can't parse the DOM`);
            } else {
              if (search.find(dom.body, request.searchCriteria)) {
                await requestLogger.important(`Tickets are available for '${request.title}'! Link: ${request.pageUrl}.`);
                await mainLogger.info(`Removing request '${request.title}' from database…`)
                await db.removeRequest(request);
              } else {
                await requestLogger.info('Tickets not found');
                if (request.expirationDate.valueOf() < Date.now()) {
                  await requestLogger.info(`Ticket monitoring request '${request.title}' has expired`);
                  await mainLogger.info(`Removing request '${request.title}' from database…`);
                  await db.removeRequest(request);
                }
              }
            }
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
