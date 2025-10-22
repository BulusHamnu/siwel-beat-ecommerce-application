import type { Response, Request, NextFunction } from "express";
import type { ApiResponse } from "../apiTypes.js";
import updateProfile from "../../services/updateProfile.js";
import type { userProfile } from "../auths/userTypes.js";
import type { updates } from "./types.js";

const updateProfileController = async (
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

export default updateProfileController;
