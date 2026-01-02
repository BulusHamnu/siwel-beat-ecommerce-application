import { type ValidationError } from "joi";
import AppError from "../../errors/appError.js";
import sanitizeData from "../sanitizeData.js";

/* ValidateBody function */
export default function validateAndSanitizeBody(data: unknown, validator: any) {
  const { value, error } = validator.validate(data, {
    stripUnknown: true,
    abortEarly: false,
  });
  if (error) {
    const validationMessages = error.details.map(
      (err: ValidationError) => err.message
    );
    throw new AppError("ValidationError", 400, true, validationMessages);
  }

  const sanitizedBody = sanitizeData(value);
  return sanitizedBody;
}
