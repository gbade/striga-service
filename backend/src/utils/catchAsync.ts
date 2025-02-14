import { RequestHandler, Request, Response, NextFunction } from 'express';

export default (catchAsync: RequestHandler) =>
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      await catchAsync(request, response, next);
    } catch (error) {
      return next(error);
    }
  };
