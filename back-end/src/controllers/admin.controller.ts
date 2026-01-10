import type { Response, Request, NextFunction } from "express";
import type { ApiResponse } from "./responseInterface.js";
import { type dashboardStatistics } from "../services/admin.service.js";
import * as adminService from "../services/admin.service.js";

/* Get admin dashboard controller */
export const getDashboard = async (
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
