import AppError from "./appError.js";
import { type customAppError } from "./appError.js";

/* Custom validation error */
export interface ValidationErrorBody {
  [fieldName: string]: any;
}

interface ValidationErrorInterface extends customAppError {
  body: ValidationErrorBody;
}

export class AppValidationError
  extends AppError
  implements ValidationErrorInterface
{
  public body: ValidationErrorBody;

  constructor(
    message: string,
    status: number,
    isOperational: boolean,
    body: ValidationErrorBody
  ) {
    super(message, status, isOperational);
    this.name = this.constructor.name;
    this.body = body;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppValidationError;
