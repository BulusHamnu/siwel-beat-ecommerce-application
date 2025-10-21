import User, { type UserDocument } from "../models/userShema.js";
import Profile, { type ProfileDocument } from "../models/profileSchema.js";
import type { updates } from "../controllers/profile/types.js";
import type { userProfile } from "../controllers/auths/userTypes.js";
import AppError from "../errors/appError.js";

const updateProfile = async (
  email: string | undefined,
  updates: updates
): Promise<userProfile> => {
  const allowFields = [
    "username",
    "firstName",
    "lastName",
    "gender",
    "bio",
    "profilePic",
    "notification",
  ];

  for (const key of Object.keys(updates) as (keyof updates)[]) {
    if (!allowFields.includes(key)) delete updates[key];

    // construt mongo dot notation object update
    if (key === "notification") {
      updates["notification.emailNotification.commentAndLikes"] =
        updates.notification?.emailNotification.commentAndLikes;

      delete updates["notification"];
    }
  }

  const user: UserDocument | null = await User.findOne({ email });
  if (!user) throw new AppError("User does not exist.", 404, true);

  const profile: ProfileDocument | null = await Profile.findOneAndUpdate(
    { userId: user._id },
    { $set: updates },
    { new: true }
  );

  if (updates["username"]) {
    user.username = updates["username"];
    await user.save();
  }

  return {
    username: user.username,
    isVerified: user.isVerified,
    email: user.email,
    role: user.role,
    ...profile?.toObject(),
  };
};

export default updateProfile;
