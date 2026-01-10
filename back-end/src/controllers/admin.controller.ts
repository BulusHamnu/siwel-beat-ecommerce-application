import type { Response, Request, NextFunction } from "express";
import type { ApiResponse } from "./responseInterface.js";
import { type UserInterface } from "../models/user.schema.js";

import {
  type dashboardStatistics,
  type adminUpdateBody,
} from "../services/admin.service.js";
import * as adminService from "../services/admin.service.js";
import { validateAdminUpdatesBody } from "../utils/validators/admin.validator.js";

/* Get admin profile controller*/
export const getAdminProfileController = async (
  req: Request<{}, ApiResponse<UserInterface>, {}, {}>,
  res: Response<ApiResponse<UserInterface>>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const admin = await adminService.getAdmin(userId);
    const response: ApiResponse<UserInterface> = {
      status: true,
      message: "Admin profile retrived sucessfully.",
      data: admin,
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/* Update admin profile controller */
export const updateAdminProfileController = async (
  req: Request<{}, ApiResponse<UserInterface>, adminUpdateBody, {}>,
  res: Response<ApiResponse<UserInterface>>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const updateData = validateAdminUpdatesBody(req.body);
    const admin = await adminService.updateAdmin(userId, updateData);

    const response: ApiResponse<UserInterface> = {
      status: true,
      message: "Admin profile updated succefully.",
      data: admin,
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
    const dashboard = await adminService.getDashboard();
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
