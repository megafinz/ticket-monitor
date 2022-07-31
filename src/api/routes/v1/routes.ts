import { Status, Router } from '../../../shared/deps/api.ts';
import { initDb } from '../../../shared/db.ts';
import * as executor from '../../../shared/executor.ts';
import * as log from '../../../shared/log.ts';
import validateTicketMonitoringRequestMiddleware from '../../middleware/validate-ticket-monitoring-request.ts';

const routesLogger = new log.ConsoleLogger('API -> Routes');
const router = new Router();

// Logging.
router.use(async (ctx, next) => {
  routesLogger.info(`Invoking route '${ctx.request.url.pathname}'…`);
  await next();
  routesLogger.info(`Route '${ctx.request.url.pathname}' processed with status ${ctx.response.status}`);
});

// GET Monitoring Requests.
router.get('/ticket-monitoring-requests', async ({ response }) => {
  const db = await initDb(routesLogger);
  const requests = await db.getRequests();
  response.body = requests;
});

// POST Monitoring Request.
router.post('/ticket-monitoring-requests', validateTicketMonitoringRequestMiddleware, async (ctx) => {
  const db = await initDb(routesLogger);
  await db.addRequest(ctx.state.payload);
  ctx.response.status = Status.Created;
  ctx.response.body = ctx.state.payload;
});

// POST Monitoring Request -> Test.
router.post('/ticket-monitoring-requests/test', validateTicketMonitoringRequestMiddleware, async (ctx) => {
  const result = await executor.executeRequest(ctx.state.payload);
  ctx.response.body = result;
});

// GET Search Criteria Presets.
router.get('/search-criteria-presets', async ({ response }) => {
  const db = await initDb(routesLogger);
  const presets = await db.getPresets();
  response.body = presets;
});

export default router;
