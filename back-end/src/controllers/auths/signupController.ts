import type { Response, Request, NextFunction } from "express";
import logger from "../../utils/logger.js";
import type { UserBody } from "./userTypes.js";
import createNewUser from "../../services/createNewUser.js";
import type { ApiResponse } from "../apiTypes.js";

const signUpController = async (
  req: Request<{}, {}, UserBody, {}>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userData: UserBody = req.body;
    const newUser = await createNewUser(userData);
    logger.info("User created successully!", { userId: newUser._id });
    // send verification email,

    const response: ApiResponse<void> = {
      status: false,
      message: "User created successfully, you can now log in.",
    };

    res.status(201).json(response);
  } catch (error: unknown) {
    next(error);
  }
};

export default signUpController;
