import type { Response, Request, NextFunction } from "express";
import { type ApiResponse } from "../responseInterface.js";
import * as cartService from "../../services/users/userCart.service.js";
import { type CartInterface } from "../../models/cart.schema.js";
import validateAndSanitizeBody from "../../utils/validators/validateAndSanitize.js";
import * as userValidator from "../../utils/validators/user.validator.js";

/* Add to cart controller */
export const addToCart = async (
  req: Request<{}, ApiResponse<void>, { trackId: string; license: string }, {}>,
  res: Response<ApiResponse<void>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { trackId, license } = validateAndSanitizeBody(
      req.body,
      userValidator.cartBodySchema,
    );

    await cartService.addToCart(trackId, license, userId);

    const response: ApiResponse<void> = {
      status: true,
      message: "Product added to cart sucessfully.",
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/* Remove from cart controller */
export const removeFromCart = async (
  req: Request<{}, ApiResponse<void>, { trackId: string; license: string }, {}>,
  res: Response<ApiResponse<void>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = req.user!;
    const { trackId, license } = validateAndSanitizeBody(
      req.body,
      userValidator.cartBodySchema,
    );

    await cartService.removeFromCart(trackId, license, user.id);

    const response: ApiResponse<void> = {
      status: true,
      message: "Product was removed from cart sucessfully.",
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/* Get cart controller */
export const getCart = async (
  req: Request<{}, ApiResponse<CartInterface>, {}, {}>,
  res: Response<ApiResponse<CartInterface>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = req.user!;

    const cart = await cartService.getUserCart(user.id);
    const response: ApiResponse<CartInterface> = {
      status: true,
      message: "Cart retrieved successfully.",
      data: cart,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
