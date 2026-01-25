import sanitizeData from "../sanitizeData.js";
import { type ValidationError } from "joi";
import AppError, { ErrorCodes } from "../../errors/appError.js";

/* Custom validation error */
export interface ValidationErrorBody {
  [fieldName: string]: any;
}

/* ValidateBody function */
export default function validateAndSanitizeBody(data: unknown, validator: any) {
  const { value, error }: { value: any; error: ValidationError } =
    validator.validate(data, {
      stripUnknown: true,
      abortEarly: false,
    });

  if (error) {
    const details: ValidationErrorBody = {};
    for (const err of error.details) {
      const errField = err.path[0]!;
      details[errField] = err.message;
    }
    throw new AppError(
      ErrorCodes.VALIDATION_ERROR,
      "Validation failed.",
      400,
      true,
      details,
    );
  }

  const sanitizedBody = sanitizeData(value);
  return sanitizedBody;
}
