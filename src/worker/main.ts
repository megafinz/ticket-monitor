import * as log from "../shared/log.ts";
import * as worker from "./worker.ts";

const logger = new log.ConsoleLogger("Worker");
const abortController = new AbortController();

Deno.addSignalListener("SIGTERM", () => {
  logger.info("Received SIGTERM signal, stopping the worker…");
  abortController.abort();
});

await worker.run(logger, abortController.signal);
logger.info("Worker finished running");
