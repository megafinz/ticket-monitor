import { Context, Router, Status } from '../../../deps/api.ts';
import { parseDate } from '../../../deps/utils.ts';
import { TicketMonitoringRequest } from '../../../model.ts';
import { validateTicketMonitoringRequest } from '../../validation.ts';
import { initDb } from '../../../db.ts';
import * as log from '../../../log.ts';

const routesLogger = new log.ConsoleLogger('API -> Routes');
const router = new Router();

// Logging.
router.use(async (ctx, next) => {
  await routesLogger.info(`Invoking route '${ctx.request.url.pathname}'…`);
  await next();
  await routesLogger.info(`Route '${ctx.request.url.pathname}' processed with status ${ctx.response.status}`);
});

// GET Monitoring Requests.
router.get('/ticket-monitoring-requests', async ({ response }) => {
  const db = await initDb(routesLogger);
  const requests = await db.getRequests();
  response.body = requests;
});

// POST Monitoring Request.
router.post('/ticket-monitoring-requests', async (ctx: Context) => {
  const body = ctx.request.body({ type: 'json' });
  const json = await body.value;
  const [valid, errors] = await validateTicketMonitoringRequest(json);
  if (!valid) {
    ctx.response.status = Status.BadRequest;
    ctx.response.body = errors;
    return;
  }
  // TODO: add to validation: date should be in future
  const expirationDate = parseDate(json.expirationDate, 'yyyy-MM-dd');
  const ticketMonitoringRequest: TicketMonitoringRequest = {
    ...json,
    expirationDate
  };
  const db = await initDb(routesLogger);
  await db.addRequest(ticketMonitoringRequest);
});

// GET Search Criteria Presets.
router.get('/search-criteria-presets', async ({ response }) => {
  const db = await initDb(routesLogger);
  const presets = await db.getPresets();
  response.body = presets;
});

export default router;
