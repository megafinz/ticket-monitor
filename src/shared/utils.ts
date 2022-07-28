import { delay } from './deps/utils.ts';
import * as log from './log.ts';

export interface RetryOptions {
  attempts: number;
  interval: number;
  logger?: log.Logger;
}

export function retryAsync<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {
    attempts: 5,
    interval: 1000,
    logger: new log.ConsoleLogger('Retry')
  }
): Promise<T> {
  const _retryAsync = async (
    fn: () => Promise<T>,
    options: RetryOptions,
    currentAttempt: number
  ): Promise<T> => {
    try {
      return await fn();
    } catch (e) {
      options.logger?.warn(`Encountered error: ${e}`);
      if (currentAttempt === options.attempts) {
        options.logger?.error('Ran out of retry attempts');
        throw e;
      }
      options.logger?.warn(`Waiting ${options.interval}ms for next retry attempt…`);
      await delay(options.interval);
      if (options.logger) {
        options.logger.warn(`Starting retry attempt #${currentAttempt + 1}…`);
      }
      return _retryAsync(fn, options, currentAttempt + 1);
    }
  };
  return _retryAsync(fn, options, 0);
}
