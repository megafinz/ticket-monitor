import { type Middleware, Status } from '../../shared/deps/api.ts';
import config from '../config.ts';

const HEADER_NAME = 'x-api-key';

const authMiddleware: Middleware = async (ctx, next) => {
  const apiKey = ctx.request.headers.get(HEADER_NAME);
  if (apiKey !== config.api.key) {
    ctx.response.status = Status.Unauthorized;
    return;
  }
  await next();
};

export default authMiddleware;
