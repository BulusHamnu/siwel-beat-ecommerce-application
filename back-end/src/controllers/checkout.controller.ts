import type { Request, Response, NextFunction } from "express";
import type { ApiResponse } from "./responseInterface.js";
import {
  getCheckoutSummary,
  type checkoutSummary,
} from "../services/checkout.services.js";

/* Check out controller */
export const checkOutController = async (
  req: Request<{}, ApiResponse<checkoutSummary>, {}, {}>,
  res: Response<ApiResponse<checkoutSummary>>,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;
    const summary = await getCheckoutSummary(user.id);

    const response: ApiResponse<checkoutSummary> = {
      status: true,
      message: "Checkout summary retrived successfully.",
      data: summary,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
