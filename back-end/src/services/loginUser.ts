import User from "../models/userShema.js";
import AppError from "../errors/appError.js";
import jwt from "jsonwebtoken";
import env from "../configs/env.js";
import type mongoose from "mongoose";

export interface LoginReturnType {
  token: string;
  user: {
    id: string | mongoose.ObjectId;
    email: string;
    isVerified: boolean;
    role: string;
  };
}

const loginUser = async (
  password: string,
  email: string
): Promise<LoginReturnType> => {
  const user = await User.findOne({ email: email });
  if (!user) throw new AppError("User does not exist.", 404, true);

  // compare password
  const passwordCorrect: boolean = await user.comparePassword(password);

  if (!passwordCorrect && user.provider !== "local")
    throw new AppError(
      "Incorrect Password, reset your password or sign in with google.",
      400,
      true
    );
  if (!passwordCorrect) throw new AppError("Incorrect Password!", 400, true);

  // sign token
  const token: string = jwt.sign(
    {
      id: user._id,
      email: user.email,
      isVerified: user.isVerified,
      role: user.role,
    },
    env.SECRET_KEY,
    { expiresIn: "7d" }
  );

  // return result
  return {
    user: {
      id: user._id as mongoose.ObjectId,
      email: user.email,
      isVerified: user.isVerified,
      role: user.role,
    },
    token,
  };
};

export default loginUser;
