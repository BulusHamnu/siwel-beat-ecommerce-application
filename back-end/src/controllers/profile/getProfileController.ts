import type { Response, Request, NextFunction } from "express";
import type { ApiResponse } from "../apiTypes.js";
import type { userProfile } from "../auths/userTypes.js";
import getProfile from "../../services/getProfile.js";

const getProfileController = async (
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

export default getProfileController;
