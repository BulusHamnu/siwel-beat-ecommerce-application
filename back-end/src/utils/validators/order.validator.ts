import Joi from "joi";
import { Types } from "mongoose";
import validateAndSanitizeBody from "./validateAndSanitize.js";

/* Get all order query body schema */
export const trackQueriesSchema = Joi.object({
  page: Joi.number().optional().default(1),
  limit: Joi.number().optional().default(10),
  status: Joi.string()
    .optional()
    .default("")
    .valid(
      "paid",
      "failed",
      "pending",
      "disputed",
      "refunded",
      "cancelled",
      "chargeback"
    )
    .default(""),
  date: Joi.string()
    .optional()
    .pattern(
      new RegExp("^(19|20)\\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$")
    )
    .default("")
    .messages({
      "string.pattern.base": "{#key} must be in yyyy-mm-dd format.",
    }),
});

export const orderParamSchema = Joi.object({
  id: Joi.string()
    .required()
    .custom((value, helpers) => {
      if (!Types.ObjectId.isValid(value)) {
        return helpers.error("orderId.invalid");
      }
      return value;
    })
    .messages({
      "any.required": "{#key} is required.",
      "orderId.invalid": "{#key} in param must be a valid ObjectId.",
    }),
});

export function validateOrderParams(data: { id: string }): {
  id: string;
} {
  return validateAndSanitizeBody(data, orderParamSchema);
}
