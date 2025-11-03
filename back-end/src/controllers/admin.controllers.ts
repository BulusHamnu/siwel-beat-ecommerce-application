import type { Response, Request, NextFunction } from "express";
import type { ApiResponse } from "./responseInterface.js";
import User, { type UserDocument } from "../models/user.schema.js";
import AppError from "../errors/appError.js";

// GET ADMIN PROFILE ROUTE
export const getAdminProfileController = async (
  req: Request<{}, ApiResponse<UserDocument>, {}, {}>,
  res: Response<ApiResponse<UserDocument>>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    const user: UserDocument | null = await User.findOne({ _id: userId });
    if (!user) throw new AppError("User does not exist.", 404, true);

    const response: ApiResponse<UserDocument> = {
      status: true,
      message: "Admin profile retrived sucessfully.",
      data: user.removeUnwantedField(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// POST UPDATE ADMIN PROFILE CONTROLLER
interface updateBody {
  firstname: string;
  username: string;
  lastname: string;
}

export const updateAdminProfileController = async (
  req: Request<{}, ApiResponse<UserDocument>, updateBody, {}>,
  res: Response<ApiResponse<UserDocument>>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const allowFields = ["username", "firstName", "lastName"];
    const updates: updateBody = req.body;

    for (const key of Object.keys(updates) as (keyof updateBody)[]) {
      if (!allowFields.includes(key)) delete updates[key];
    }

    const user: UserDocument | null = await User.findByIdAndUpdate(
      { _id: userId },
      { $set: updates },
      { new: true }
    );
    if (!user) throw new AppError("User does not exist.", 404, true);

    const response: ApiResponse<UserDocument> = {
      status: true,
      message: "Admin profile updated succefully.",
      data: user.removeUnwantedField(),
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
