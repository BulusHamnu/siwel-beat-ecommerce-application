import type { Response, Request, NextFunction } from "express";
import type { ApiResponse } from "./responseInterface.js";
import type { UserProfile } from "../services/profile.service.js";
import { type ProfileUpdatesInput } from "../services/profile.service.js";
import * as userService from "../services/profile.service.js";
import AppError, { ErrorCodes } from "../errors/appError.js";
import supabase from "../services/supabase.js";
import validateAndSanitizeBody from "../utils/validators/validateAndSanitize.js";
import * as userValidator from "../utils/validators/user.validator.js";
import env from "../configs/env.js";
import { checkAndResizeImgRatio } from "../utils/helpers.js";
import mainQueue from "../queues/main.queue.js";
import { getFavourites } from "../services/users/userFavourites.service.js";
import type { ObjectId } from "mongoose";
import { toProfileRes } from "../mappers/profile.mapper.js";
import {
  toFavouritesRes,
  type FavouriteResponse,
} from "../mappers/favourite.mappers.js";

/* Get user profile  */
export const getProfile = async (
  req: Request<{}, ApiResponse<UserProfile>, { email: string }, {}>,
  res: Response<ApiResponse<UserProfile>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId: string = req.user!.id;

    const profile = await userService.getProfile(userId);
    const profileRes = toProfileRes(profile);

    const response: ApiResponse<UserProfile> = {
      status: true,
      message: "Profile retrieved successfully.",
      data: profileRes,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/* Update user profile  */
export const updateProfile = async (
  req: Request<{}, ApiResponse<UserProfile>, ProfileUpdatesInput, {}>,
  res: Response<ApiResponse<UserProfile>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId: string | undefined = req.user!.id;
    const sanitizedUpdates: ProfileUpdatesInput = validateAndSanitizeBody(
      req.body,
      userValidator.userUpdateBodySchema,
    );

    const profile = await userService.updateProfile(userId, sanitizedUpdates);
    const profileRes = toProfileRes(profile);

    const response: ApiResponse<UserProfile> = {
      status: true,
      message: "Profile updated successfully.",
      data: profileRes,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/* Post profile avatar */
async function uploadAvatar(imageFile: Express.Multer.File) {
  const imageBuffer = await checkAndResizeImgRatio(imageFile.buffer, "avatar");

  return await supabase.uploadFile(
    env.IMAGE_FILES_BUCKET,
    imageFile.originalname,
    "avatars/",
    imageBuffer,
  );
}

export const updateProfileAvatar = async (
  req: Request<{}, ApiResponse<{ url: string }>, {}, {}>,
  res: Response<ApiResponse<{ url: string }>>,
  next: NextFunction,
): Promise<void> => {
  let pictureUrl: string = "";

  try {
    const userId = req.user!.id;
    const imageFile = req.file;

    if (!imageFile)
      throw new AppError(
        ErrorCodes.IMAGE_REQUIRED,
        "Please provide an image for your avatar.",
        400,
        true,
        null,
      );

    const pictureUrl = await uploadAvatar(imageFile);
    const avatarUrl = await userService.updateAvatar(userId, pictureUrl);

    const response: ApiResponse<{ url: string }> = {
      status: true,
      message: "Avatar was uploaded successfully.",
      data: { url: avatarUrl },
    };

    res.status(200).json(response);
  } catch (error) {
    if (pictureUrl) {
      await mainQueue.add(
        "delete-files",
        { bucket: "images", paths: [pictureUrl] },
        {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 2000,
          },
          removeOnComplete: 1000,
          removeOnFail: 5000,
        },
      );
    }

    next(error);
  }
};

/* Remove profile avatar */
export const removeProfileAvatar = async (
  req: Request<{}, ApiResponse<null>, {}, {}>,
  res: Response<ApiResponse<null>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    await userService.removeAvatar(userId);

    const response: ApiResponse<null> = {
      status: true,
      message: "Avatar was removed successfully.",
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/* Get user's public profile */
interface ProfileSnapshot {
  id: string | ObjectId;
  username: string;
  isVerified: boolean;
  email: string;
  avatar: string;
  firstName: string;
  lastName: string;
  gender: string;
  bio: string;
}

export const getUserPublicProfile = async (
  req: Request<{ id: string }, ApiResponse<ProfileSnapshot>, {}, {}>,
  res: Response<ApiResponse<ProfileSnapshot>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId: string = req.params.id;

    const {
      username,
      isVerified,
      email,
      avatar,
      firstName,
      lastName,
      gender,
      bio,
      id,
    } = await userService.getProfile(userId);

    const response: ApiResponse<ProfileSnapshot> = {
      status: true,
      message: "User's profile retrieved successfully.",
      data: {
        id,
        username,
        isVerified,
        email,
        avatar,
        firstName,
        lastName,
        gender,
        bio,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/* Get user's favourites list */
export const getUserFavourites = async (
  req: Request<{ id: string }, ApiResponse<FavouriteResponse[]>, {}, {}>,
  res: Response<ApiResponse<FavouriteResponse[]>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId: string = req.params.id;

    const userFavourites = await getFavourites(userId);
    const favouritesRes = toFavouritesRes(userFavourites);

    const response: ApiResponse<FavouriteResponse[]> = {
      status: true,
      message: "User's favourites retrieved successfully.",
      data: favouritesRes,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
