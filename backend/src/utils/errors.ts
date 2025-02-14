export class ApiError extends Error {
  statusCode: number;
  type: string;
  errors?: any[];
  log?: boolean;

  constructor(type: string, message: string, statusCode?: number, log = true) {
    super(message);

    Error.captureStackTrace(this, this.constructor);

    this.name = this.constructor.name;
    this.type = type;
    this.statusCode = Number(statusCode ?? 500);
    this.log = log;
  }
}

export class BadRequestError extends ApiError {
  constructor(message: string, type?: string) {
    super(type ?? 'E_BAD_REQUEST', message, 400);
  }
}

export class RecordNotFoundError extends ApiError {
  constructor(message: string, type?: string) {
    super(type ?? 'E_NOT_FOUND', message, 404);
  }
}
