import type { Response, Request, NextFunction } from "express";
import logger from "../../utils/logger.js";
import type { createUserBody } from "./userTypes.js";
import createNewUser from "../../services/createNewUser.js";
import type { ApiResponse } from "../apiTypes.js";
import sendEmail from "../../services/sendEmail.js";
import Template from "../../utils/emailTemplate.js";

const signUpController = async (
  req: Request<{}, {}, createUserBody, {}>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userData: createUserBody = req.body;
    const newUser = await createNewUser(userData);
    logger.info("User created successully!", { userId: newUser._id });
    // send verification email
    await sendEmail(
      newUser.email,
      "Please verify you email.",
      Template.emailVerificationTemplate(
        newUser.username,
        newUser.emailVerification.code
      )
    );

    const response: ApiResponse<void> = {
      status: true,
      message: "User created successfully, you can now log in.",
    };

    res.status(201).json(response);
  } catch (error: unknown) {
    next(error);
  }
};

export default signUpController;
