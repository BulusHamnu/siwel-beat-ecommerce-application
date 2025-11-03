import type { Response, Request, NextFunction } from "express";
import type { ApiResponse } from "./responseInterface.js";
import type { userProfile } from "./userTypes.js";
import { getProfile, updateProfile } from "../services/profile.services.js";
import type { updates } from "./types.js";

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
