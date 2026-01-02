import Joi, { type ValidationError } from "joi";
import AppError from "../../errors/appError.js";
import sanitizeData from "../sanitizeData.js";

/* Sign up validator */
export const signUpValidator = Joi.object({
  username: Joi.string().required().min(3).messages({
    "string.min": "username can not be less than 3 letters.",
  }),
  firstName: Joi.string().required().min(3).messages({
    "string.min": "firstName can not be less than 3 letters.",
  }),
  lastName: Joi.string().required().min(3).messages({
    "string.min": "lastName can not be less than 3 letters.",
  }),
  email: Joi.string().email().required(),
  password: Joi.string()
    .required()
    .min(5)
    .pattern(
      new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$")
    )
    .messages({
      "string.pattern.base":
        "Password must contain an uppercase, a number, letter and symbols.",
      "string.min": "Password is short.",
    }),
  confirmPassword: Joi.string().required().valid(Joi.ref("password")).messages({
    "any.only": "Confirm password must be the same with password.",
  }),
});

/* Login validator */
export const loginValidator = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required().min(5),
});

/* Validate email and code */
export const verifyEmailAndCodeValidator = Joi.object({
  email: Joi.string().email().required(),
  code: Joi.number().required(),
});

/* Valid single email field*/
export const validateEmail = Joi.string().email().required().label("email");

/* Validate new password reset body */
export const validatePasswordResetBody = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string()
    .required()
    .min(5)
    .pattern(
      new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$")
    )
    .messages({
      "string.pattern.base":
        "Password must contain an uppercase, a number, letter and symbols.",
      "string.min": "Password is short.",
    }),
  confirmPassword: Joi.string().required().valid(Joi.ref("password")).messages({
    "any.only": "Confirm password must be the same with password.",
  }),
});

/* ValidateBody function */
export function validateAndSanitizeBody(data: unknown, validator: any) {
  const { value, error } = validator.validate(data, {
    stripUnknown: true,
    abortEarly: false,
  });
  if (error) {
    console.log(error);
    const validationMessages = error.details.map(
      (err: ValidationError) => err.message
    );
    throw new AppError("ValidationError", 400, true, validationMessages);
  }

  const sanitizedBody = sanitizeData(value);
  return sanitizedBody;
}
