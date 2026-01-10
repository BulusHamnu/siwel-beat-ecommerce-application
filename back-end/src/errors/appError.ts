// custom error class
export interface customAppError extends Error {
  readonly status: number;
  readonly isOperational: boolean;
}

class AppError extends Error implements customAppError {
  public readonly status: number;
  public readonly isOperational: boolean;
  public body: any | null;

  constructor(message: string, status: number, isOperational: boolean) {
    super(message);
    this.status = status;
    this.isOperational = isOperational;
    this.name = this.constructor.name;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
