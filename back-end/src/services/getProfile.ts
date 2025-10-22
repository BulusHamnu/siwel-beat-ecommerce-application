import AppError from "../errors/appError.js";
import User from "../models/userShema.js";
import Profile from "../models/profileSchema.js";
import type { userProfile } from "../controllers/auths/userTypes.js";
import type { UserDocument } from "../models/userShema.js";
import type { ProfileDocument } from "../models/profileSchema.js";

const getProfile = async (id: string): Promise<userProfile> => {
  const user: UserDocument | null = await User.findOne({ _id: id });
  if (!user) throw new AppError("User does not exist.", 404, true);

  const profile: ProfileDocument | null = await Profile.findOne({
    userId: user?._id,
  });

  return {
    username: user.username,
    isVerified: user.isVerified,
    email: user.email,
    role: user.role,
    ...profile?.toObject(),
  };
};

export default getProfile;
