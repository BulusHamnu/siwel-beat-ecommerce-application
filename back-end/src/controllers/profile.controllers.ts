import type { Response, Request, NextFunction } from "express";
import type { ApiResponse } from "./responseInterface.js";
import type { userProfile } from "./userTypes.js";
import {
  getProfile,
  updateProfile,
  updateProfilePicture,
} from "../services/profile.services.js";
import type { updates } from "../services/profile.services.js";
import AppError from "../errors/appError.js";
import supabase from "../services/supabase.js";

// GET USER PROFILE PROFILE CONTROLLER
export const getProfileController = async (
  req: Request<
    {},
    { status: boolean; message: string; data?: userProfile },
    { email: string },
    {}
  >,
  res: Response<{ status: boolean; message: string; data?: userProfile }>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId: string | undefined = req.user?.id;
    const profile: userProfile = await getProfile(userId || "");

    const response: ApiResponse<userProfile> = {
      status: true,
      message: "Profile retrieved successfully.",
      data: profile,
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// UPDATE USER PROFILE CONTROLLER
export const updateProfileController = async (
  req: Request<
    {},
    { status: boolean; message: string; data?: userProfile },
    updates,
    {}
  >,
  res: Response<{ status: boolean; message: string; data?: userProfile }>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId: string | undefined = req.user?.id;
    const updates: updates = req.body;

    const profile: userProfile = await updateProfile(userId, updates);

    const response: ApiResponse<userProfile> = {
      status: true,
      message: "Profile updated successfully.",
      data: profile,
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// POST PROFILE PICTURE CONTROLLER
export const updateProfilePictureController = async (
  req: Request<{}, ApiResponse<{ picture: string }>, {}, {}>,
  res: Response<ApiResponse<{ picture: string }>>,
  next: NextFunction
): Promise<void> => {
  let pictureUrl: string = "";

  try {
    const image = req.file;
    const userId = req.user?.id;

    if (!image) throw new AppError("Please provide an image.", 400, true);

    // upload picture
    pictureUrl = await supabase.uploadFile(
      "images",
      image.originalname,
      "pictures/",
      image.buffer
    );

    const picture = await updateProfilePicture(userId!, pictureUrl);

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
