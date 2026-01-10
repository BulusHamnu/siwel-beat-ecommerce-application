import type { Response, Request, NextFunction } from "express";
import type { ApiResponse } from "./responseInterface.js";
import type { UserProfile } from "./userTypes.js";
import { type ProfileUpdatesInput } from "../services/shared/user.service.js";
import * as userService from "../services/shared/user.service.js";
import AppError from "../errors/appError.js";
import supabase from "../services/supabase.js";
import validateAndSanitizeBody from "../utils/validators/validateAndSanitize.js";
import * as userValidator from "../utils/validators/user.validator.js";

/* Get user profile controller */
export const getProfile = async (
  req: Request<
    {},
    { status: boolean; message: string; data?: UserProfile },
    { email: string },
    {}
  >,
  res: Response<{ status: boolean; message: string; data?: UserProfile }>,
  next: NextFunction
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
  next: NextFunction
): Promise<void> => {
  try {
    const userId: string | undefined = req.user!.id;
    const sanitizedUpdates: ProfileUpdatesInput = validateAndSanitizeBody(
      req.body,
      userValidator.userUpdateBodySchema
    );

    const profile: UserProfile = await userService.updateProfile(
      userId,
      sanitizedUpdates
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
export const updateProfilePicture = async (
  req: Request<{}, ApiResponse<{ picture: string }>, {}, {}>,
  res: Response<ApiResponse<{ picture: string }>>,
  next: NextFunction
): Promise<void> => {
  let pictureUrl: string = "";

  try {
    const image = req.file;
    const userId = req.user!.id;

    if (!image) throw new AppError("Please provide an image.", 400, true);

    // upload picture
    pictureUrl = await supabase.uploadFile(
      "images",
      image.originalname,
      "pictures/",
      image.buffer
    );

    const picture = await userService.updateProfilePicture(userId!, pictureUrl);

    const response: ApiResponse<{ picture: string }> = {
      status: true,
      message: "Profile picture was uploaded successful.",
      data: { picture },
    };

    res.status(200).json(response);
  } catch (error) {
    await supabase.deleteFiles("images", [pictureUrl]);
    next(error);
  }
};
