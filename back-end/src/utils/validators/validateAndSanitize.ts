import sanitizeData from "../sanitizeData.js";
import { type ValidationError } from "joi";
import AppValidationError, {
  type ValidationErrorBody,
} from "../../errors/validationError.js";

/* ValidateBody function */
export default function validateAndSanitizeBody(data: unknown, validator: any) {
  const { value, error }: { value: any; error: ValidationError } =
    validator.validate(data, {
      stripUnknown: true,
      abortEarly: false,
    });
  if (error) {
    const errObj: ValidationErrorBody = {};
    for (const err of error.details) {
      const errField = err.path[0]!;
      errObj[errField] = err.message;
    }
    throw new AppValidationError("ValidationError", 400, true, errObj);
  }

  const sanitizedBody = sanitizeData(value);
  return sanitizedBody;
}
