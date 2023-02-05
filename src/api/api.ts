import { Application, oakCors, Router } from "../shared/deps/api.ts";
import type { Logger } from "../shared/log.ts";
import config from "./config.ts";
import auth from "./middleware/auth.ts";
import v1Router from "./routes/v1/routes.ts";

export async function run(logger: Logger, abortSignal: AbortSignal) {
  const app = new Application();
  const router = new Router().use(
    "/api/v1",
    v1Router.routes(),
    v1Router.allowedMethods()
  );

  app.use(
    oakCors({
      origin: config.api.cors?.origins || [],
    })
  );
  app.use(auth);
  app.use(router.routes());
  app.use(router.allowedMethods());

  logger.info(`Starting API server on port ${config.api.port}…`);

  try {
    await app.listen({
      port: config.api.port,
      signal: abortSignal,
    });
  } catch (e) {
    logger.error(`There was a problem starting API server: ${e}`);
  }
}
