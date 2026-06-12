import Joi from "joi";

/* Sign up validator */
export const signupBodySchema = Joi.object({
  username: Joi.string().required().min(3).lowercase().messages({
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
      new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$"),
    )
    .messages({
      "string.pattern.base":
        "Password must contain an uppercase, a number, letter and symbols.",
      "string.min": "Password is short.",
    }),
  confirmPassword: Joi.string().required().valid(Joi.ref("password")).messages({
    "any.only": "Confirm password must be the same with password.",
  }),
  gender: Joi.string().optional().valid("male", "female"),
});

/* Login validator */
export const loginBodySchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required().min(5),
});

/* Validate email and code */
export const emailAndCodeBodySchema = Joi.object({
  email: Joi.string().email().required(),
  code: Joi.string().required().length(6),
});

/* Validate single email field*/
export const validateEmail = Joi.string().email().required().label("email");

/* Validate new password reset body */
export const resetPasswordBodySchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string()
    .required()
    .min(5)
    .pattern(
      new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$"),
    )
    .messages({
      "string.pattern.base":
        "Password must contain an uppercase, a number, letter and symbols.",
      "string.min": "Password is short.",
    }),
  confirmPassword: Joi.string().required().valid(Joi.ref("password")).messages({
    "any.only": "Confirm password must be the same with password.",
  }),
  resetToken: Joi.string().required(),
});
