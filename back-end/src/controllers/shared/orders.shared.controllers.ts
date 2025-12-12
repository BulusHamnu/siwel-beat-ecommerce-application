import type { Request, Response, NextFunction } from "express";
import { type ApiResponse } from "../responseInterface.js";
import { type orderResult } from "../../services/shared/orders.shared.service.js";
import { getAllOrders } from "../../services/shared/orders.shared.service.js";
import Order, { type OrderInterface } from "../../models/order.schema.js";
import AppError from "../../errors/appError.js";

/* Get all user orders controller */
export const getAllOrdersController = async (
  req: Request<
    {},
    ApiResponse<orderResult>,
    {},
    { page: number; limit: number; status: string; date: string }
  >,
  res: Response<ApiResponse<orderResult>>,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;
    const { page, limit, status, date } = req.query;

    const userId = user.role === "user" ? user.id : ""; // For admin get all order while user get all their order
    const result = await getAllOrders(
      Number(page || 1),
      Number(limit || 10),
      status,
      date,
      userId
    );

    const response: ApiResponse<orderResult> = {
      status: true,
      message: "Orders retrived succesfully.",
      data: result,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/* Get an order controller */
export const getOrderController = async (
  req: Request<{ id: string }, ApiResponse<OrderInterface>, {}, {}>,
  res: Response<ApiResponse<OrderInterface>>,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const queries: { _id: string; userId?: string } = {
      _id: id,
    };
    if (user.role === "user") queries["userId"] = user.id; // For admin to get any order while user get their order

    const order: OrderInterface | null = await Order.findOne(queries).populate(
      "products",
      "title basicPrice premiumPrice description type key status bpm tags genre _id"
    );
    if (!order) throw new AppError("Order was not found.", 404, true);

    const response: ApiResponse<OrderInterface> = {
      status: true,
      message: "Order retrived successfully.",
      data: order,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
