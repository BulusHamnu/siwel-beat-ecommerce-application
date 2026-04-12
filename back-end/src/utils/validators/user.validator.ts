import Joi from "joi";
import { Types } from "mongoose";

/* Update user validator */
export const userUpdateBodySchema = Joi.object({
  username: Joi.string().optional().min(3).lowercase().messages({
    "string.min": "username can not be less than 3 letters.",
  }),
  firstName: Joi.string().optional().min(3).messages({
    "string.min": "firstName can not be less than 3 letters.",
  }),
  lastName: Joi.string().optional().min(3).messages({
    "string.min": "lastName can not be less than 3 letters.",
  }),
  gender: Joi.string().optional().valid("male", "female"),
  bio: Joi.string().optional().max(255).messages({
    "string.max": "Bio is too long.",
  }),
  notification: Joi.object({
    emailNotification: Joi.object({
      commentAndLikes: Joi.boolean().required().messages({
        "any.required": "{#key} is required in emailNotification.",
        "boolean.base": "{#key} must be boolean.",
      }),
      orders: Joi.boolean().required().messages({
        "any.required": "{#key} is required in emailNotification.",
        "boolean.base": "{#key} must be boolean.",
      }),
    }).required(),
  })
    .optional()
    .messages({
      "any.required": "{#key} is required in notification.",
    }),
});

/* Get all purchase query schema */
export const getPurchaseQuerySchema = Joi.object({
  page: Joi.number().optional().default(1),
  limit: Joi.number().optional().default(10),
  type: Joi.string().optional().valid("basic", "premium").messages({
    "any.only": "Purchase type must be basic or premium.",
  }),
});

/* Track id validation schema */
//
const trackIdFieldType = Joi.string()
  .required()
  .custom((value, helpers) => {
    if (!Types.ObjectId.isValid(value)) {
      return helpers.error("trackId.invalid");
    }
    return value;
  })
  .messages({
    "any.required": "trackId is required.",
    "trackId.invalid": "trackId must be a valid ObjectId.",
  });

export const trackIdSchema = Joi.object({
  trackId: trackIdFieldType,
});

/* Cart validation schema */
export const cartBodySchema = Joi.object({
  trackId: trackIdFieldType,
  license: Joi.string().required().valid("basic", "premium").messages({
    "any.only": "license must be basic or premium.",
  }),
}).messages({
  "any.required": "{#key} is required.",
});
