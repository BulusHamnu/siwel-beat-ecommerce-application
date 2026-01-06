import Joi from "joi";
import { Types } from "mongoose";
import validateAndSanitizeBody from "./validateAndSanitize.js";

/* trackBodySchema */
export const trackBodySchema = Joi.object({
  title: Joi.string().required().min(3).max(100),
  description: Joi.string().required().max(1200).min(50),
  type: Joi.string().required().valid("kit", "single", "album").lowercase(),
  key: Joi.string().required(),
  bpm: Joi.number().required().min(10),
  tags: Joi.array().items(Joi.string().lowercase()).min(1).required(),
  basicPrice: Joi.number().required().min(500),
  premiumPrice: Joi.number().required().min(800),
  genre: Joi.string().required().lowercase(),
})
  .custom((value, helpers) => {
    if (value.premiumPrice <= value.basicPrice) {
      return helpers.error("premiumprice.invalid");
    }
    return value;
  })
  .messages({
    "premiumprice.invalid":
      "premiumPrice can not be equal to or less than basicPrice.",
    "any.required": "{#key} is required.",
  });

/* Get all track querybody schema */
export const trackQueriesSchema = Joi.object({
  page: Joi.number().optional().default(1),
  limit: Joi.number().optional().default(10),
  genre: Joi.string().optional().default(""),
  search: Joi.string().optional().default(""),
  type: Joi.string().optional().default(""),
  tags: Joi.any().optional().default(""),
});

/* validate track id in the parameter */
const paramTrackId = Joi.string()
  .required()
  .custom((value, helpers) => {
    if (!Types.ObjectId.isValid(value)) {
      return helpers.error("trackId.invalid");
    }
    return value;
  })
  .label("id")
  .messages({
    "any.required": "{#key} is required.",
    "trackId.invalid": "track id in param must be a valid ObjectId.",
  });

export function validateTrackidParam(trackId: string): string {
  return validateAndSanitizeBody(trackId, paramTrackId);
}

/* Track updates request body schema */
export const trackUpdateBodySchema = Joi.object({
  title: Joi.string().optional().min(3).max(100),
  description: Joi.string().optional().max(1200).min(50),
  type: Joi.string().optional().valid("kit", "single", "album").lowercase(),
  key: Joi.string().optional(),
  bpm: Joi.number().optional().min(10),
  tags: Joi.array().items(Joi.string().lowercase()).min(1).optional(),
  basicPrice: Joi.number().optional().min(500),
  premiumPrice: Joi.number().optional().min(800),
  genre: Joi.string().optional().lowercase(),
})
  .custom((value, helpers) => {
    if (value.premiumPrice <= value.basicPrice) {
      return helpers.error("premiumprice.invalid");
    }
    return value;
  })
  .messages({
    "premiumprice.invalid":
      "premiumPrice can not be equal to or less than basicPrice.",
  });

/* Download track query schema  */
export const downloadQuerySchema = Joi.object({
  type: Joi.string().required().valid("license", "audio"),
  license: Joi.string().required().valid("basic", "premium").messages({
    "any.only": "license must be basic or premium.",
  }),
});

/* Comment body schema */
export const commentBodySchema = Joi.object({
  content: Joi.string().required(),
  parentId: Joi.string().optional().allow(null).default(null),
}).messages({
  "any.required": "{#key} is required.",
});

export const getCommentParamBody = Joi.object({
  id: paramTrackId,
  commentId: Joi.string()
    .required()
    .custom((value, helpers) => {
      if (!Types.ObjectId.isValid(value)) {
        return helpers.error("commentId.invalid");
      }
      return value;
    })
    .messages({
      "any.required": "{#key} is required.",
      "commentId.invalid": "commentId in param must be a valid ObjectId.",
    }),
});
