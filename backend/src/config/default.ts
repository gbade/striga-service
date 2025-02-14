import type { Config } from '.';
import { getEnvironmentValue } from '.';

export const config: Config = {
  app: {
    name: 'Striga Service',
  },

  server: {
    port: parseInt(getEnvironmentValue('PORT', '3000')),
  },
  db: {
    url: getEnvironmentValue('MONGO_URL', 'mongodb://localhost:27017/striga'),
  },
  env: getEnvironmentValue('NODE_ENV', 'development') as Config['env'],

  logging: {
    stdout: {
      enabled: true,
      level: 'info',
      pretty: true,
    },
    sensitiveParameters: ['password'],
  },
};
