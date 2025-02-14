import { config as dotenvConfig } from 'dotenv';
import { Environment } from './environments/types';
import * as R from 'ramda';

dotenvConfig();

const env = process.env.NODE_ENV ?? 'development';

export interface Config {
  app: {
    name: string;
  };

  server: {
    port: number;
  };

  db: {
    url: string;
  };

  env: Environment;

  logging: {
    stdout: {
      enabled: boolean;
      level: string;
      pretty: boolean;
    };
    sensitiveParameters: string[];
  };
}

export const getEnvironmentValue = (
  key: string,
  defaultValue?: string
): string => {
  const envVal = process.env[key] ?? defaultValue;

  if (!envVal && envVal !== '') {
    throw new Error(`env variable ${key} has to be defined`);
  }

  return envVal;
};

/* eslint-disable */
const envConfig = require(`./environments/${env}`)?.config;
const defaultConfig = require('./default').config;
/* eslint-enable */

export const config = R.mergeDeepRight(
  defaultConfig,
  envConfig
) as object as Config;
