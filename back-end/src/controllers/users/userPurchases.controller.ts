import type { Response, Request, NextFunction } from "express";
import type { ApiResponse } from "../responseInterface.js";
import {
  getAllPurchases,
  type PurchasesResult,
} from "../../services/users/userPurchases.service.js";
import AppError, { ErrorCodes } from "../../errors/appError.js";
import Purchase, {
  type PurchaseInterface,
} from "../../models/purchase.schema.js";
import validateAndSanitizeBody from "../../utils/validators/validateAndSanitize.js";
import * as userValidator from "../../utils/validators/user.validator.js";

/* Get user's purchases controller */
export const getAllPurchase = async (
  req: Request<{}, ApiResponse<PurchasesResult>, {}, {}>,
  res: Response<ApiResponse<PurchasesResult>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = req.user!;
    const { page, limit, type } = validateAndSanitizeBody(
      req.query,
      userValidator.getPurchaseQuerySchema,
    );

    const purchases = await getAllPurchases(
      user.id,
      type,
      Number(page || 1),
      Number(limit || 10),
    );
    const response: ApiResponse<PurchasesResult> = {
      status: true,
      message: "Purchases retrived successfully",
      data: purchases,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/* Get user's purchase controller */
export const getPurchase = async (
  req: Request<{ id: string }, {}, {}, {}>,
  res: Response<ApiResponse<PurchaseInterface>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const purchase = await Purchase.findOne({ userId: user.id, _id: id });
    if (!purchase)
      throw new AppError(
        ErrorCodes.PURCHASE_NOT_FOUND,
        "Purchase not found",
        404,
        true,
        null,
      );

    const response: ApiResponse<PurchaseInterface> = {
      status: true,
      message: "Purchase retrived successfully",
      data: purchase,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
