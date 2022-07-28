import { type Middleware, Status } from '../../shared/deps/api.ts';
import { parseDate } from '../../shared/deps/utils.ts';
import type { TicketMonitoringRequest, TicketMonitoringRequestDto } from '../../shared/model.ts';
import { validateTicketMonitoringRequest } from '../validation.ts';

const validateTicketMonitoringRequestMiddleware: Middleware = async (ctx, next) => {
  const body = ctx.request.body({ type: 'json' });
  let json: Record<string, unknown>;
  try {
    json = await body.value;
  } catch {
    ctx.response.status = Status.BadRequest;
    ctx.response.body = 'Missing or invalid JSON body';
    return;
  }
  const [valid, errors] = await validateTicketMonitoringRequest(json);
  if (!valid) {
    ctx.response.status = Status.BadRequest;
    ctx.response.body = errors;
    return;
  }
  // TODO: add to validation: date should be in future
  const dto = json as TicketMonitoringRequestDto;
  const expirationDate = parseDate(dto.expirationDate, 'yyyy-MM-dd');
  const model: TicketMonitoringRequest = {
    ...dto,
    expirationDate
  };
  ctx.state['payload'] = model;
  await next();
};

export default validateTicketMonitoringRequestMiddleware;
