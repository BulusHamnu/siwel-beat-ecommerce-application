import User, { type UserInterface } from "../../models/user.schema.js";
import Profile, { type ProfileInterface } from "../../models/profile.schema.js";
import type { userProfile } from "../../controllers/userTypes.js";
import AppError from "../../errors/appError.js";
import supabase from "../supabase.js";
import env from "../../configs/env.js";

/* Get profile */
export const getProfile = async (id: string): Promise<userProfile> => {
  const user: UserInterface | null = await User.findOne({ _id: id });
  if (!user) throw new AppError("User not found.", 404, true);

  const profile: ProfileInterface | null = await Profile.findOne({
    userId: user._id,
  });
  const profileObj = profile?.toObject();
  delete profileObj.cart;

  return {
    username: user.username,
    isVerified: user.isVerified,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    ...profileObj,
  };
};

/* Update profile */
export interface ProfileUpdatesInput {
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

export interface ProfileUpdates extends ProfileUpdatesInput {
  "notification.emailNotification.commentAndLikes"?: boolean | undefined;
}

function filterProfileUpdates(updates: ProfileUpdates) {
  const allowFields = [
    "username",
    "firstName",
    "lastName",
    "gender",
    "bio",
    "profilePic",
    "notification",
  ];

  for (const key of Object.keys(updates) as (keyof ProfileUpdatesInput)[]) {
    if (!allowFields.includes(key)) delete updates[key];

    if (key === "notification") {
      updates["notification.emailNotification.commentAndLikes"] =
        updates.notification?.emailNotification.commentAndLikes;

      delete updates["notification"];
    }
  }
}

export const updateProfile = async (
  id: string | undefined,
  updates: ProfileUpdates
): Promise<userProfile> => {
  const user: UserInterface | null = await User.findOne({ _id: id });
  if (!user) throw new AppError("User not found.", 404, true);

  filterProfileUpdates(updates);
  const profile: ProfileInterface | null = await Profile.findOneAndUpdate(
    { userId: user._id },
    { $set: updates },
    { new: true }
  );

  if (updates["username"]) {
    user.username = updates["username"];
    await user.save();
  }

  const profileObj = profile?.toObject();
  delete profileObj.cart;

  return {
    username: user.username,
    isVerified: user.isVerified,
    email: user.email,
    role: user.role,
    ...profileObj,
  };
};

/* Update profile picture */
export const updateProfilePicture = async (
  userId: string,
  pictureUrl: string
): Promise<string> => {
  const profile: ProfileInterface | null = await Profile.findOne({ userId });
  const imgBucket = env.IMAGE_FILES_BUCKET;
  const oldPicturePath = profile?.picture.split(`${imgBucket}/`)[1] || "";

  const publicUrl = await supabase.getPublicUrl(imgBucket, pictureUrl); // saved in db so it can be access anywhere
  const updatedProfile: ProfileInterface | null =
    await Profile.findOneAndUpdate(
      { userId },
      { $set: { picture: publicUrl } },
      { new: true }
    );

  if (!updatedProfile)
    throw new AppError("Unable to update profile picture.", 500, true);

  // delete old picture
  if (oldPicturePath) await supabase.deleteFiles("images", [oldPicturePath]);
  return publicUrl;
};
