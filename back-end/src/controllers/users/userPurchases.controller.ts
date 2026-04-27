import type { Response, Request, NextFunction } from "express";
import type { ApiResponse } from "../responseInterface.js";
import * as purchaseService from "../../services/users/userPurchases.service.js";
import validateAndSanitizeBody from "../../utils/validators/validateAndSanitize.js";
import * as userValidator from "../../utils/validators/user.validator.js";
import {
  toPurchaseRes,
  toPurchasesRes,
  type PurchaseResponse,
} from "../../mappers/purchase.mappers.js";
import { type Pagination } from "../responseInterface.js";

/* Get user's purchases */
export interface PurchasesResult {
  purchases: PurchaseResponse[];
  pagination: Pagination;
}

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

    const { purchases, pagination } = await purchaseService.getUserPurchases(
      user.id,
      type,
      Number(page),
      Number(limit),
    );

    const purchaseRes = toPurchasesRes(purchases);
    const response: ApiResponse<PurchasesResult> = {
      status: true,
      message: "Purchases retrieved successfully",
      data: {
        purchases: purchaseRes,
        pagination,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/* Get user's purchase */
export const getPurchase = async (
  req: Request<{ id: string }, ApiResponse<PurchaseResponse>, {}, {}>,
  res: Response<ApiResponse<PurchaseResponse>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const purchase = await purchaseService.getPurchase(userId, id);
    const purchaseRes = toPurchaseRes(purchase);

    const response: ApiResponse<PurchaseResponse> = {
      status: true,
      message: "Purchase retrieved successfully",
      data: purchaseRes,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
