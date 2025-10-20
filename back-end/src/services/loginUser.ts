import User from "../models/userShema.js";
import AppError from "../errors/appError.js";
import type { ProfileDocument } from "../models/profileSchema.js";
import type { userProfile } from "../controllers/auths/userTypes.js";
import Profile from "../models/profileSchema.js";
import jwt from "jsonwebtoken";
import env from "../configs/env.js";

interface returnType {
  token: string;
  userProfile: userProfile;
}

const loginUser = async (
  password: string,
  email: string
): Promise<returnType> => {
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

  // return result
  return {
    userProfile: {
      ...profile?.toObject(),
      email: user.email,
      isVerified: user.isVerified,
    },
    token,
  };
};

export default loginUser;
