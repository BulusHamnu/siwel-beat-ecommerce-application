import type { Request, Response, NextFunction } from "express";
import type { ApiResponse } from "./responseInterface.js";
import { createCheckout } from "../services/checkout.service.js";
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

export const checkOut = async (
  req: Request<{}, ApiResponse<{ url: string }>, { items: string[] }, {}>,
  res: Response<ApiResponse<{ url: string }>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = req.user!;
    const { items } = validateCheckoutReqBody(req.body);

    const url = await createCheckout(user.id, items);

    const response: ApiResponse<{ url: string }> = {
      status: true,
      message: "Checkout summary retrived successfully.",
      data: {
        url,
      },
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};
