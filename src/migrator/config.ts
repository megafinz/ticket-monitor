import { dbConfig, type DbConfig } from "../shared/config.ts";

export interface Config {
  db: DbConfig;
}

const cfg: Config = {
  db: dbConfig,
};

export default cfg;
