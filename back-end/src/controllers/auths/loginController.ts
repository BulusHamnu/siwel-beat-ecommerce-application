import type { Request, Response, NextFunction } from "express";
import type { ApiResponse } from "../apiTypes.js";
import User from "../../models/userShema.js";
import AppError from "../../errors/appError.js";
import type { userProfile } from "./userTypes.js";
import Profile from "../../models/profileSchema.js";
import env from "../../configs/env.js";
import jwt from "jsonwebtoken";
import type { ProfileDocument } from "../../models/profileSchema.js";

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
    const user = await User.findOne({ email: email });
    if (!user) throw new AppError("User does not exist.", 404, true);

    // compare password
    const passwordCorrect: boolean = await user.comparePassword(password);
    console.log(passwordCorrect);

    if (!passwordCorrect) throw new AppError("Incorrect Password!", 400, true);

    const profile: ProfileDocument | null = await Profile.findOne({
      userId: user._id,
    });

    // sign token
    const token: string = jwt.sign(
      {
        id: user._id,
        email: user.email,
        isVerified: user.isVerified,
      },
      env.SECRET_KEY,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      secure: env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "strict",
      httpOnly: true,
    });

    const response: ApiResponse<userProfile> = {
      status: true,
      message: "Login successully!",
      data: {
        ...profile?.toObject(),
        email: user.email,
        isVerified: user.isVerified,
      },
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export default logInController;
