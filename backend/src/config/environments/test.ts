import { Config, getEnvironmentValue } from '../';
import { DeepPartial, Environment } from './types';

export const config: DeepPartial<Config> = {
  env: Environment.Test,

  db: {
    url: getEnvironmentValue(
      'MONGO_URL_TEST',
      'mongodb://localhost:27017/striga-test'
    ),
  },

  server: {
    port: Number(getEnvironmentValue('PORT_TEST', '5555')),
  },
};
