import { ReportOptions } from "../shared/model.ts";
import * as tg from "./report/tg.ts";

export class ReportError extends Error {
  constructor(msg: string) {
    super(`[ReportError]: ${msg}`);
    Object.setPrototypeOf(this, ReportError.prototype);
  }
}

export async function report(
  message: string,
  options: ReportOptions
): Promise<void> {
  try {
    switch (options.type) {
      case "telegram":
        return await tg.sendMessage(options.chatId, message);
    }
  } catch (e) {
    throw new ReportError(`Failed to send report: ${e}`);
  }
}
