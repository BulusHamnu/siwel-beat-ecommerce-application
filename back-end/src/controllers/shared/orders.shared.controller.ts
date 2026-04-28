import type { Request, Response, NextFunction } from "express";
import { type ApiResponse, type Pagination } from "../responseInterface.js";
import * as orderService from "../../services/shared/ordersShared.service.js";
import * as orderValidator from "../../utils/validators/order.validator.js";
import validateAndSanitizeBody from "../../utils/validators/validateAndSanitize.js";
import {
  toOrderResponse,
  toOrdersResponse,
  type OrderResponse,
} from "../../mappers/order.mappers.js";

/* Get all user orders  */
interface OrdersQueryParams {
  page: number;
  limit: number;
  status: string;
  date: string;
}

interface OrdersResult {
  orders: OrderResponse[];
  pagination: Pagination;
}

export const getAllOrders = async (
  req: Request<{}, ApiResponse<OrdersResult>, {}>,
  res: Response<ApiResponse<OrdersResult>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = req.user!;

    const { page, limit, status, date }: OrdersQueryParams =
      validateAndSanitizeBody(req.query, orderValidator.trackQueriesSchema);

    const { orders, pagination } = await orderService.getAllOrders({
      page,
      limit,
      status,
      date,
      user,
    });

    const ordersRes = toOrdersResponse(orders);
    const response: ApiResponse<OrdersResult> = {
      status: true,
      message: "Orders retrieved succesfully.",
      data: {
        orders: ordersRes,
        pagination,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/* Get an order  */
export const getOrder = async (
  req: Request<{ id: string }, ApiResponse<OrderResponse>, {}, {}>,
  res: Response<ApiResponse<OrderResponse>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = orderValidator.validateOrderParams(req.params);

    const order = await orderService.getOrder(id, user);

    const orderRes = toOrderResponse(order);
    const response: ApiResponse<OrderResponse> = {
      status: true,
      message: "Order retrieved successfully.",
      data: orderRes,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
