import type { Response, Request, NextFunction } from "express";
import { type ApiResponse } from "../responseInterface.js";
import * as cartService from "../../services/users/userCart.service.js";
import { type CartItem } from "../../models/profile.schema.js";

/* Add to cart controller */
export const addToCartController = async (
  req: Request<{}, ApiResponse<void>, { trackId: string; license: string }, {}>,
  res: Response<ApiResponse<void>>,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;
    const { trackId, license } = req.body;

    await cartService.addToCart(trackId, license, user.id);

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
export const removeFromCartController = async (
  req: Request<{}, ApiResponse<void>, { trackId: string; license: string }, {}>,
  res: Response<ApiResponse<void>>,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;
    const { trackId, license } = req.body;

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
export const getCartController = async (
  req: Request<{}, ApiResponse<CartItem[]>, {}, {}>,
  res: Response<ApiResponse<CartItem[]>>,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;

    const cart = await cartService.getUserCart(user.id);
    const response: ApiResponse<CartItem[]> = {
      status: true,
      message: "Cart retrived successfully.",
      data: cart,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
