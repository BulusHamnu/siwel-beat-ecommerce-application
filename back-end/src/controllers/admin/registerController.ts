import { type Response, type Request, type NextFunction } from "express";
import AppError from "../../errors/appError.js";
import type { ApiResponse } from "../apiTypes.js";
import createNewAdmin, {
  type createAdminReqBody,
} from "../../services/createNewAdmin.js";
import logger from "../../utils/logger.js";
import sendEmail from "../../services/sendEmail.js";
import Template from "../../utils/emailTemplate.js";

const registerController = async (
  req: Request<
    {},
    { status: boolean; message: string },
    createAdminReqBody,
    {}
  >,
  res: Response<{ status: boolean; message: string }>,
  next: NextFunction
): Promise<void> => {
  try {
    const adminBody = req.body;
    if (adminBody.role && adminBody.role === "user")
      throw new AppError(
        "You are not allowed to create admin accounts",
        403,
        true
      );

    const admin = await createNewAdmin(adminBody);
    logger.info("Admin created successully!", { userId: admin._id });

    // send verification email
    await sendEmail(
      admin.email,
      "Please verify you email.",
      Template.emailVerificationTemplate(
        admin.username,
        admin.emailVerification.code
      )
    );

    const response: ApiResponse<void> = {
      status: true,
      message: "Admin created successfully.",
    };
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export default registerController;
