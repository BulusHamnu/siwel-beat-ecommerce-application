import type { Request, Response, NextFunction } from "express";
import type { ApiResponse } from "./responseInterface.js";
import {
  createCheckout,
  type CheckoutItem,
} from "../services/checkout.service.js";
import Joi from "joi";
import validateAndSanitizeBody from "../utils/validators/validateAndSanitize.js";

/* Check out  */
function validateCheckoutReqBody(data: { items: CheckoutItem[] }): {
  items: CheckoutItem[];
} {
  const itemsSchema = Joi.object({
    items: Joi.array()
      .items(
        Joi.object({
          productId: Joi.string().required(),
          license: Joi.string().valid("basic", "premium").required(),
        }),
      )
      .min(1)
      .required(),
  });

  return validateAndSanitizeBody(data, itemsSchema);
}

export const checkOut = async (
  req: Request<{}, ApiResponse<{ url: string }>, { items: CheckoutItem[] }, {}>,
  res: Response<ApiResponse<{ url: string }>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = req.user!;
    const { items } = validateCheckoutReqBody(req.body);

    const url = await createCheckout(user.id, items);

    const response: ApiResponse<{ url: string }> = {
      status: true,
      message: "Order was created successfully.",
      data: {
        url,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
