import { config } from '@app/config';
import { Environment } from '@app/config/environments/types';
import { ApiError } from '@app/utils/errors';
import { logger } from '@app/utils/logger';
import { ErrorRequestHandler } from 'express';

export const isProduction = (): boolean =>
  config.env === Environment.Production;

export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  // Handled errors
  if (err instanceof ApiError) {
    const { statusCode, errors, log } = err;
    {
      log &&
        logger.error(
          JSON.stringify(
            {
              code: err.statusCode,
              errors: err.errors,
              message: err.message,
              ...(isProduction() && { stack: err.stack }),
            },
            null,
            2
          )
        );
    }

    return res.status(statusCode).send({ errors, message: err.message });
  }

  // Unhandled errors
  logger.error(err);
  return res
    .status(500)
    .send({ errors: [{ message: 'Something went wrong' }] });
};
