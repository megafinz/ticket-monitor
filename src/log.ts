import * as tg from './tg.ts';

export interface AsyncLogger {
  info(message: string): Promise<void>;
  warn(message: string): Promise<void>;
  error(message: string): Promise<void>;
  important(message: string): Promise<void>;
}

export class ConsoleLogger implements AsyncLogger {
  info(message: string) {
    console.log(new Date(), message);
    return Promise.resolve();
  }

  warn(message: string) {
    console.warn(new Date(), message);
    return Promise.resolve();
  }

  error(message: string) {
    console.error(new Date(), message);
    return Promise.resolve();
  }

  important(message: string) {
    console.info(new Date(), message);
    return Promise.resolve();
  }
}

export class TgLogger implements AsyncLogger {
  constructor(private chatId: string) { }

  info(_: string) {
    return Promise.resolve();
  }

  async important(message: string) {
    await tg.sendMessage(this.chatId, '❗️❗️❗️ Important', message);
  }

  async warn(message: string) {
    await tg.sendMessage(this.chatId, '🟡 Warning', message);
  }

  async error(message: string) {
    await tg.sendMessage(this.chatId, '🔴 Error', message);
  }

}

export class CompositeLogger implements AsyncLogger {

  constructor(private loggers: AsyncLogger[]) { }

  async info(message: string): Promise<void> {
    for (const logger of this.loggers) {
      await logger.info(message);
    }
  }

  async warn(message: string): Promise<void> {
    for (const logger of this.loggers) {
      await logger.warn(message);
    }
  }

  async error(message: string): Promise<void> {
    for (const logger of this.loggers) {
      await logger.error(message);
    }
  }

  async important(message: string): Promise<void> {
    for (const logger of this.loggers) {
      await logger.important(message);
    }
  }

}
