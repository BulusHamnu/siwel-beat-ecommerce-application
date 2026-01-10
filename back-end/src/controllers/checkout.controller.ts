import type { Request, Response, NextFunction } from "express";
import type { ApiResponse } from "./responseInterface.js";
import {
  getCheckoutSummary,
  type checkoutSummary,
} from "../services/checkout.service.js";
import Joi from "joi";
import validateAndSanitizeBody from "../utils/validators/validateAndSanitize.js";

/* Check out controller */
function validateCheckoutReqBody(data: { items: string[] }): {
  items: string[];
} {
  const itemsSchema = Joi.object({
    items: Joi.array().items(Joi.string()).min(1).required(),
  });

  return validateAndSanitizeBody(data, itemsSchema);
}

export const checkOutController = async (
  req: Request<{}, ApiResponse<checkoutSummary>, { items: string[] }, {}>,
  res: Response<ApiResponse<checkoutSummary>>,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;
    const { items } = validateCheckoutReqBody(req.body);

    const summary = await getCheckoutSummary(user.id, items);
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
