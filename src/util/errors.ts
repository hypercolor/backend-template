import {CustomError} from 'ts-custom-error';
import {HttpStatusCode} from '../models/enums/http-status-code';
import {IMeta} from '../models/internal/i-meta';

export type IDomainErrorClass = new(message: string) => DomainError;

export class DomainError extends CustomError {
  public isDomainError = true;
  public constructor(public statusCode: number, public message: string, public meta?: IMeta) {
    super(message);
  }
}

export class InvalidParameterError extends DomainError {
  constructor(message: string, meta?: IMeta) {
    super(HttpStatusCode.BAD_REQUEST, message, meta);
  }
}

export class ForbiddenError extends DomainError {
  constructor(message: string, meta?: IMeta) {
    super(HttpStatusCode.FORBIDDEN, message, meta);
  }
}

export class UnprocessableEntityError extends DomainError {
  constructor(message: string, meta?: IMeta) {
    super(HttpStatusCode.UNPROCESSABLE_ENTITY, message, meta);
  }
}

export class ConflictError extends DomainError {
  constructor(message: string, meta?: IMeta) {
    super(HttpStatusCode.CONFLICT, message, meta);
  }
}

export class NotFoundError extends DomainError {
  constructor(message: string, meta?: IMeta) {
    super(HttpStatusCode.NOT_FOUND, message, meta);
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message: string, meta?: IMeta) {
    super(HttpStatusCode.UNAUTHORIZED, message, meta);
  }
}

export class InternalServerError extends DomainError {

  public static wrap(error: Error) {
    return new InternalServerError(error.toLocaleString());
  }

  constructor(message: string, meta?: IMeta) {
    super(HttpStatusCode.INTERNAL_SERVER_ERROR, message, meta);
  }
}

