import type { Response, Request, NextFunction } from "express";
import env from "../../configs/env.js";
import type { ApiResponse } from "../apiTypes.js";

const logoutController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    res.cookie("token", "", {
      secure: env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "strict",
      httpOnly: true,
    });

    const response: ApiResponse<void> = {
      status: true,
      message: "Logout successully!",
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export default logoutController;
