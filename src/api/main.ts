import * as log from "../shared/log.ts";
import * as api from "./api.ts";

const logger = new log.ConsoleLogger("API");
const abortController = new AbortController();

Deno.addSignalListener("SIGTERM", () => {
  logger.info("Received SIGTERM signal, stopping the API server…");
  abortController.abort("Received SIGTERM");
});

Deno.addSignalListener("SIGINT", () => {
  logger.info("Received SIGINT signal, stopping the API server…");
  abortController.abort("Received SIGINT");
});

await api.run(logger, abortController.signal);
logger.info("API server finished running");
