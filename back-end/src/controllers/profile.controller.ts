import type { Response, Request, NextFunction } from "express";
import type { ApiResponse } from "./responseInterface.js";
import type { UserProfile } from "./userTypes.js";
import { type ProfileUpdatesInput } from "../services/profile.service.js";
import * as userService from "../services/profile.service.js";
import AppError, { ErrorCodes } from "../errors/appError.js";
import supabase from "../services/supabase.js";
import validateAndSanitizeBody from "../utils/validators/validateAndSanitize.js";
import * as userValidator from "../utils/validators/user.validator.js";
import env from "../configs/env.js";
import { checkAndResizeImgRatio } from "../utils/helpers.js";

/* Get user profile controller */
export const getProfile = async (
  req: Request<
    {},
    { status: boolean; message: string; data?: UserProfile },
    { email: string },
    {}
  >,
  res: Response<{ status: boolean; message: string; data?: UserProfile }>,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId: string = req.user!.id;
    const profile: UserProfile = await userService.getProfile(userId);

    const response: ApiResponse<UserProfile> = {
      status: true,
      message: "Profile retrieved successfully.",
      data: profile,
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/* Update user profile controller */
export const updateProfile = async (
  req: Request<
    {},
    { status: boolean; message: string; data?: UserProfile },
    ProfileUpdatesInput,
    {}
  >,
  res: Response<{ status: boolean; message: string; data?: UserProfile }>,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId: string | undefined = req.user!.id;
    const sanitizedUpdates: ProfileUpdatesInput = validateAndSanitizeBody(
      req.body,
      userValidator.userUpdateBodySchema,
    );

    const profile: UserProfile = await userService.updateProfile(
      userId,
      sanitizedUpdates,
    );

    const response: ApiResponse<UserProfile> = {
      status: true,
      message: "Profile updated successfully.",
      data: profile,
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/* Post profile picture */
export const updateUserAvatar = async (
  req: Request<{}, ApiResponse<{ avatar: string }>, {}, {}>,
  res: Response<ApiResponse<{ avatar: string }>>,
  next: NextFunction,
): Promise<void> => {
  let pictureUrl: string = "";

  try {
    const userId = req.user!.id;
    const image = req.file;

    if (!image)
      throw new AppError(
        ErrorCodes.VALIDATION_ERROR,
        "Please provide an image.",
        400,
        true,
        null,
      );
    const imageBuffer = await checkAndResizeImgRatio(image.buffer, "avatar");

    // upload picture
    pictureUrl = await supabase.uploadFile(
      env.IMAGE_FILES_BUCKET,
      image.originalname,
      env.USER_AVATAR_FOLDER,
      imageBuffer,
    );

    const avatar = await userService.updateUserAvatar(userId!, pictureUrl);

    const response: ApiResponse<{ avatar: string }> = {
      status: true,
      message: "Profile picture was uploaded successful.",
      data: { avatar },
    };
    res.status(200).json(response);
  } catch (error) {
    if (pictureUrl) await supabase.deleteFiles("images", [pictureUrl]);
    next(error);
  }
};
