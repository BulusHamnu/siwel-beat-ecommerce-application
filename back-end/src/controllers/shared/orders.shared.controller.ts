import type { Request, Response, NextFunction } from "express";
import { type ApiResponse } from "../responseInterface.js";
import { type orderResult } from "../../services/shared/ordersShared.service.js";
import * as orderService from "../../services/shared/ordersShared.service.js";
import { type OrderPlusItems } from "../../services/shared/ordersShared.service.js";
import * as orderValidator from "../../utils/validators/order.validator.js";
import validateAndSanitizeBody from "../../utils/validators/validateAndSanitize.js";

/* Get all user orders controller */
interface OrdersQueryBody {
  page: number;
  limit: number;
  status: string;
  date: string;
}

export const getAllOrders = async (
  req: Request<{}, ApiResponse<orderResult>, {}, OrdersQueryBody>,
  res: Response<ApiResponse<orderResult>>,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;

    const { page, limit, status, date }: OrdersQueryBody =
      validateAndSanitizeBody(req.query, orderValidator.trackQueriesSchema);

    const userId = user.role === "user" ? user.id : ""; // For admin get all order while user get all their order
    const result = await orderService.getAllOrders(
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
export const getOrder = async (
  req: Request<{ id: string }, ApiResponse<OrderPlusItems>, {}, {}>,
  res: Response<ApiResponse<OrderPlusItems>>,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = orderValidator.validateOrderParams(req.params);

    const order: OrderPlusItems = await orderService.getOrder(id, user);

    const response: ApiResponse<OrderPlusItems> = {
      status: true,
      message: "Order retrived successfully.",
      data: order,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
