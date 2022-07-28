import { Application, Router } from '../shared/deps/api.ts';
import config from '../shared/config.ts';
import type { AsyncLogger } from '../shared/log.ts';
import auth from './middleware/auth.ts';
import v1Router from './routes/v1/routes.ts';

export async function run(logger: AsyncLogger) {
  const app = new Application();
  const router = new Router().use('/api/v1', v1Router.routes(), v1Router.allowedMethods());

  app.use(auth);
  app.use(router.routes());
  app.use(router.allowedMethods());

  await logger.info(`Starting API server on port ${config.api.port}…`);

  try {
    await app.listen({
      port: config.api.port
    });
  } catch (e) {
    logger.error(`There was a problem starting API server: ${e}`);
  }
}
