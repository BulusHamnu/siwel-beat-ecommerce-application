import type { Request, Response, NextFunction } from "express";
import type { ApiResponse } from "../apiTypes.js";
import type { userProfile } from "./userTypes.js";
import env from "../../configs/env.js";
import loginUser from "../../services/loginUser.js";

interface loginBody {
  email: string;
  password: string;
}
// login controller
const logInController = async (
  req: Request<{}, ApiResponse<userProfile>, loginBody, {}>,
  res: Response<ApiResponse<userProfile>>,
  next: NextFunction
): Promise<void> => {
  try {
    const { password, email } = req.body;
    const result = await loginUser(password, email);

    res.cookie("token", result.token, {
      secure: env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "strict",
      httpOnly: true,
    });

    const response: ApiResponse<userProfile> = {
      status: true,
      message: "Login successully!",
      data: result.userProfile,
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export default logInController;
