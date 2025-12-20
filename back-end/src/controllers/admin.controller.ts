import type { Response, Request, NextFunction } from "express";
import type { ApiResponse } from "./responseInterface.js";
import User, { type UserInterface } from "../models/user.schema.js";
import AppError from "../errors/appError.js";
import {
  getDashboard,
  type dashboardStatistics,
} from "../services/admin.service.js";

/* Get admin profile controller*/
export const getAdminProfileController = async (
  req: Request<{}, ApiResponse<UserInterface>, {}, {}>,
  res: Response<ApiResponse<UserInterface>>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    const user: UserInterface | null = await User.findOne({ _id: userId });
    if (!user) throw new AppError("User does not exist.", 404, true);

    const response: ApiResponse<UserInterface> = {
      status: true,
      message: "Admin profile retrived sucessfully.",
      data: user.removeUnwantedField(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/* Update admin profile controller */
interface updateBody {
  firstname: string;
  username: string;
  lastname: string;
}

export const updateAdminProfileController = async (
  req: Request<{}, ApiResponse<UserInterface>, updateBody, {}>,
  res: Response<ApiResponse<UserInterface>>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const allowFields = ["username", "firstName", "lastName"];
    const updates: updateBody = req.body;

    for (const key of Object.keys(updates) as (keyof updateBody)[]) {
      if (!allowFields.includes(key)) delete updates[key];
    }

    const user: UserInterface | null = await User.findByIdAndUpdate(
      { _id: userId },
      { $set: updates },
      { new: true }
    );
    if (!user) throw new AppError("User does not exist.", 404, true);

    const response: ApiResponse<UserInterface> = {
      status: true,
      message: "Admin profile updated succefully.",
      data: user.removeUnwantedField(),
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/* Get admin dashboard controller */
export const getDashboardController = async (
  req: Request,
  res: Response<ApiResponse<dashboardStatistics>>,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;

    const dashboard = await getDashboard();
    const response: ApiResponse<dashboardStatistics> = {
      status: true,
      message: "Dashboard retrived successfully.",
      data: dashboard,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
