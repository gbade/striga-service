import * as R from 'ramda';
import pino from 'pino';
import { config } from '../config';

const dest = process.stdout;

const options: pino.LoggerOptions = {
  enabled: config.logging.stdout.enabled,
  level: config.logging.stdout.level,
  name: config.app.name,
  serializers: R.omit(['wrapResponseSerializer'], pino.stdSerializers),
  redact: {
    paths: config.logging.sensitiveParameters,
    censor: '[HIDDEN]',
  },
};

export const logger = pino(options, dest);
