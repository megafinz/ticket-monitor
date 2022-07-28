import * as log from '../shared/log.ts';
import * as api from './api.ts';

const apiLogger = new log.ConsoleLogger('API');
await api.run(apiLogger);
