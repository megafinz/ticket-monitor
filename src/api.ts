import { Application, Router } from './deps/api.ts';
import auth from './api/middleware/auth.ts';
import v1Router from './api/routes/v1/routes.ts';
import config from './config.ts';
import { AsyncLogger } from './log.ts';

const app = new Application();
const router = new Router().use('/api/v1', v1Router.routes(), v1Router.allowedMethods());

app.use(auth);
app.use(router.routes());
app.use(router.allowedMethods());

export async function run(logger: AsyncLogger) {
  await logger.info(`Starting API server on port ${config.api.port}…`);
  try {
    await app.listen({
      port: config.api.port
    });
  } catch (e) {
    logger.error(`There was a problem starting API server: ${e}`);
  }
}
