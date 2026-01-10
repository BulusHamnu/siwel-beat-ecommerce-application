import Joi from "joi";
import { type adminUpdateBody } from "../../services/admin.service.js";
import validateAndSanitizeBody from "./validateAndSanitize.js";

/* Admin updates body schema */
export const adminUpdatesSchema = Joi.object({
  firstName: Joi.string().optional(),
  username: Joi.string().optional().lowercase(),
  lastName: Joi.string().optional(),
});

export function validateAdminUpdatesBody(data: adminUpdateBody) {
  return validateAndSanitizeBody(data, adminUpdatesSchema);
}
