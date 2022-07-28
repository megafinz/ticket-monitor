import * as log from '../shared/log.ts';
import * as migrator from './migrator.ts';

const logger = new log.ConsoleLogger('Migrator');
await migrator.run(logger);
