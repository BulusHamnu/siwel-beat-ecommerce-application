import Joi from "joi";
import validateAndSanitizeBody from "./validateAndSanitize.js";
import { Types } from "mongoose";

/* Get all notification query param validator */
export function validateNotificationQuery(data: { read: boolean }): {
  read: boolean;
} {
  const notificationQuerySchema = Joi.object({
    read: Joi.boolean().optional(),
  });

  return validateAndSanitizeBody(data, notificationQuerySchema);
}

/* Validate notification params for notificationId  */
export const notificationParamSchema = Joi.object({
  id: Joi.string()
    .required()
    .custom((value, helpers) => {
      if (!Types.ObjectId.isValid(value)) {
        return helpers.error("notificationId.invalid");
      }
      return value;
    })
    .messages({
      "any.required": "{#key} is required.",
      "notificationId.invalid": "{#key} in param must be a valid ObjectId.",
    }),
});

export function validateNotificationParams(data: { id: string }): {
  id: string;
} {
  return validateAndSanitizeBody(data, notificationParamSchema);
}
