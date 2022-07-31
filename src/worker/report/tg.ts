import { retryAsync } from '../../shared/utils.ts';
import config from '../config.ts';

export class TgError extends Error {
  constructor(msg: string) {
    super(`[TelegramError]: ${msg}`);
    Object.setPrototypeOf(this, TgError.prototype);
  }
}

export async function sendMessage(chatId: string, message: string) {
  if (!config.worker.report.telegram?.botToken) {
    throw new TgError('Configuration is missing Telegram bot token');
  }
  const tgUrl = `https://api.telegram.org/bot${config.worker.report.telegram.botToken}/sendMessage`;
  try {
    await retryAsync(async () => {
      await fetch(tgUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message
        })
      });
    });
  } catch (e) {
    throw new TgError(`Failed to send Telegram message: ${e}`);
  }
}
