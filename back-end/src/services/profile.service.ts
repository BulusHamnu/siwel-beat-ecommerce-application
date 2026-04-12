import User, { type UserInterface } from "../models/user.schema.js";
import Profile, { type ProfileInterface } from "../models/profile.schema.js";
import type { UserProfile } from "../controllers/userTypes.js";
import AppError, { ErrorCodes } from "../errors/appError.js";
import supabase from "./supabase.js";
import env from "../configs/env.js";
import mongoose from "mongoose";

/* Get profile */
export const getProfile = async (id: string): Promise<UserProfile> => {
  const user: UserInterface | null = await User.findOne({ _id: id });
  if (!user)
    throw new AppError(
      ErrorCodes.USER_NOT_FOUND,
      "User not found.",
      404,
      true,
      null,
    );

  const profile: ProfileInterface | null = await Profile.findOne({
    userId: user._id,
  });

  const profileObj = profile?.toObject();
  delete profileObj.avatarPath;

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
      orders: boolean;
    };
  };
}

export interface ProfileUpdates extends ProfileUpdatesInput {
  "notification.emailNotification.commentAndLikes"?: boolean | undefined;
  "notification.emailNotification.orders"?: boolean | undefined;
}

function filterProfileUpdates(updates: ProfileUpdates) {
  const allowFields = [
    "username",
    "firstName",
    "lastName",
    "gender",
    "bio",
    "notification",
  ];

  for (const key of Object.keys(updates) as (keyof ProfileUpdatesInput)[]) {
    if (!allowFields.includes(key)) delete updates[key];

    if (key === "notification") {
      const emailNotification = updates["notification"]?.emailNotification;
      if (!emailNotification) return;

      if (typeof emailNotification.commentAndLikes === "boolean") {
        updates["notification.emailNotification.commentAndLikes"] =
          emailNotification.commentAndLikes;
      }

      if (typeof emailNotification.orders === "boolean") {
        updates["notification.emailNotification.orders"] =
          emailNotification.orders;
      }

      delete updates["notification"];
    }
  }
}

export const updateProfile = async (
  id: string | undefined,
  updates: ProfileUpdates,
): Promise<UserProfile> => {
  const session = await mongoose.startSession();
  try {
    filterProfileUpdates(updates);

    const profile: ProfileInterface | null = await Profile.findOneAndUpdate(
      { userId: id },
      { $set: updates },
      { new: true, session },
    );

    if (!profile) {
      throw new AppError(
        ErrorCodes.PROFILE_NOT_FOUND,
        "Profile not found.",
        404,
        true,
        null,
      );
    }

    let user: UserInterface | null = null;
    if (updates["username"]) {
      const username = updates["username"].toLowerCase().replace(" ", "_");
      user = await User.findOneAndUpdate(
        { _id: id },
        { $set: { username } },
        { new: true, session },
      );
    } else {
      user = await User.findOne({ _id: id }).session(session);
    }

    if (!user) {
      throw new AppError(
        ErrorCodes.USER_NOT_FOUND,
        "User not found.",
        404,
        true,
        null,
      );
    }

    const profileObj = profile?.toObject();
    delete profileObj.avatarPath;

    return {
      username: user.username,
      isVerified: user.isVerified,
      email: user.email,
      role: user.role,
      ...profileObj,
    };
  } finally {
    session.endSession();
  }
};

/* Update user avatar */
export const updateUserAvatar = async (
  userId: string,
  pictureUrl: string,
): Promise<string> => {
  const profile: ProfileInterface | null = await Profile.findOne({ userId });
  const imgBucket = env.IMAGE_FILES_BUCKET;
  const oldPicturePath = profile?.avatarPath;

  const publicUrl = await supabase.getPublicUrl(imgBucket, pictureUrl); // need public url for avatar because it's public.

  const updated = await Profile.updateOne(
    { userId },
    { $set: { avatar: publicUrl, avatarPath: pictureUrl } },
  );

  if (updated.modifiedCount !== 1)
    throw new AppError(
      ErrorCodes.PROFILE_UPDATE_ERROR,
      "Unable to update profile picture.",
      500,
      true,
      null,
    );

  // delete old picture
  if (oldPicturePath) await supabase.deleteFiles("images", [oldPicturePath]);
  return publicUrl;
};
