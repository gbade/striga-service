import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '@app/api/middleware/errorHandler';
import { BadRequestError } from '@app/utils/errors';
import { logger } from '@app/utils/logger';

jest.mock('@app/utils/logger');

describe('errorHandler middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      headersSent: false,
    };
    next = jest.fn();
  });

  it('should handle ApiError and send appropriate response', () => {
    const error = new BadRequestError('Bad request');
    errorHandler(error, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(error.statusCode);
    expect(res.send).toHaveBeenCalledWith({
      errors: error.errors,
      message: error.message,
    });
    expect(logger.error).toHaveBeenCalled();
  });

  it('should call next if headers are already sent', () => {
    res.headersSent = true;
    const error = new Error('Test error');
    errorHandler(error, req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it('should handle non-ApiError and send generic response', () => {
    const error = new Error('Test error');
    errorHandler(error, req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      errors: [{ message: 'Something went wrong' }],
    });
    expect(logger.error).toHaveBeenCalled();
  });
});
