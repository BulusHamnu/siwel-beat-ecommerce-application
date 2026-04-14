import type { Response, Request, NextFunction } from "express";
import type { ApiResponse } from "../responseInterface.js";
import { type PurchasesResult } from "../../services/users/userPurchases.service.js";
import * as purchaseService from "../../services/users/userPurchases.service.js";
import { type PurchaseInterface } from "../../models/purchase.schema.js";
import validateAndSanitizeBody from "../../utils/validators/validateAndSanitize.js";
import * as userValidator from "../../utils/validators/user.validator.js";

/* Get user's purchases */
export const getAllPurchases = async (
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

    const purchases = await purchaseService.getUserPurchases(
      user.id,
      type,
      Number(page || 1),
      Number(limit || 10),
    );

    const response: ApiResponse<PurchasesResult> = {
      status: true,
      message: "Purchases retrieved successfully",
      data: purchases,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/* Get user's purchase */
export const getPurchase = async (
  req: Request<{ id: string }, {}, {}, {}>,
  res: Response<ApiResponse<PurchaseInterface>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const purchase = await purchaseService.getPurchase(userId, id);

    const response: ApiResponse<PurchaseInterface> = {
      status: true,
      message: "Purchase retrieved successfully",
      data: purchase,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
