import User, { type UserDocument } from "../models/user.schema.js";
import Profile, { type ProfileDocument } from "../models/profile.schema.js";
import type { userProfile } from "../controllers/userTypes.js";
import AppError from "../errors/appError.js";

// GET USER PROFILE SERVICE
export const getProfile = async (id: string): Promise<userProfile> => {
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

// UPDATE USER PROFILE SERVICE
export interface updates {
  username?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  bio?: string;
  profilePic?: string;
  email?: string;
  notification?: {
    emailNotification: {
      commentAndLikes: boolean;
    };
  };
}

export interface ProfileUpdates extends updates {
  "notification.emailNotification.commentAndLikes": boolean | undefined;
}

export const updateProfile = async (
  id: string | undefined,
  updates: ProfileUpdates
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

  const user: UserDocument | null = await User.findOne({ _id: id });
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
