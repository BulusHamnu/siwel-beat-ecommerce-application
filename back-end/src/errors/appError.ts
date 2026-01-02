// custom error class
export interface customAppError extends Error {
  readonly status: number;
  readonly isOperational: boolean;
  readonly body?: any | null;
}

class AppError extends Error implements customAppError {
  public readonly status: number;
  public readonly isOperational: boolean;
  public body: any | null;

  constructor(
    message: string,
    status: number,
    isOperational: boolean,
    body = null
  ) {
    super(message);
    this.status = status;
    this.isOperational = isOperational;
    this.name = this.constructor.name;
    this.body = body;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
