import { getDateRange } from "../../utils/helpers.js";
import Order, { type OrderInterface } from "../../models/order.schema.js";
import { type Pagination } from "../../controllers/responseInterface.js";
import AppError, { ErrorCodes } from "../../errors/appError.js";
import type { userPayload } from "../../middlewares/requiredAuth.js";
import OrderItem, {
  type OrderItemInterface,
} from "../../models/orderItem.schema.js";
import logger from "../../utils/logger.js";
import type { PopulatedCartItem } from "../users/userCart.service.js";

/* Create order */
export async function createOrder(orderItems: PopulatedCartItem[]) {
  logger.info("OrderItems", { orderItems });

  throw new AppError(
    "NOT_IMPLEMENTED",
    "Checkout is not available yet.",
    501,
    true,
    null,
  );
}

/* Get all orders */
export interface OrderPlusItems extends OrderInterface {
  items?: OrderItemInterface[];
}

export interface OrdersQuery {
  status?: string;
  userId?: string;
  createdAt?: any;
}

// Build order query
function buildQuery(
  status: string,
  date: string,
  user: userPayload,
): OrdersQuery {
  const query: OrdersQuery = {};

  if (user.role !== "admin") query["userId"] = user.id;
  if (status) query["status"] = status.toLowerCase();
  if (date) {
    const { start, end } = getDateRange(date);
    query["createdAt"] = { $gte: start, $lte: end };
  }

  return query;
}

// Get orders and order document counts
export async function getOrdersAndCount(
  skip: number,
  limit: number,
  query: OrdersQuery,
): Promise<{
  ordersCounts: number;
  ordersWithOverhead: OrderInterface[];
}> {
  const orderCountQuery = Order.find(query).countDocuments();
  const OrdersQuery = Order.find(query)
    .skip(skip)
    .limit(limit + 1)
    .sort({ createdAt: -1 })
    .lean<OrderInterface[]>();

  const [ordersCounts, ordersWithOverhead] = await Promise.all([
    orderCountQuery,
    OrdersQuery,
  ]);

  return { ordersCounts, ordersWithOverhead };
}

async function attachItemsToOrders(
  orders: OrderPlusItems[],
): Promise<OrderPlusItems[]> {
  const orderMap = new Map<string, any>();

  // type orderWithItems = OrderInterface & { items?: OrderItemInterface[] };
  orders.forEach((order) => {
    order.items = [];
    orderMap.set(String(order._id), order);
  });

  const orderIds = orders.map((order) => order._id);
  const ordersItems = await OrderItem.find({
    orderId: { $in: orderIds },
  }).lean<OrderItemInterface[]>();

  ordersItems.forEach((item) => {
    const order = orderMap.get(item.orderId.toString());
    if (!order) return;
    order.items.push(item);
  });

  return [...orders];
}

export const getAllOrders = async ({
  page = 1,
  limit = 10,
  status,
  date,
  user,
}: {
  page: number;
  limit: number;
  status: string;
  date: string;
  user: userPayload;
}): Promise<{ orders: OrderPlusItems[]; pagination: Pagination }> => {
  const skip = (page - 1) * limit;

  const query = buildQuery(status, date, user);
  const { ordersCounts, ordersWithOverhead } = await getOrdersAndCount(
    skip,
    limit,
    query,
  );

  const hasNext = ordersWithOverhead.length > limit;
  const totalPage = Math.ceil(ordersCounts / limit);
  const ordersX = ordersWithOverhead.slice(0, limit);

  const orders = await attachItemsToOrders(ordersX);
  return {
    orders,
    pagination: {
      page,
      limit,
      hasNext,
      totalPage,
    },
  };
};

/* Get order */
export const getOrder = async (
  id: string,
  user: userPayload,
): Promise<OrderPlusItems> => {
  const queries: { _id: string; userId?: string } = {
    _id: id,
  };

  if (user.role !== "admin") queries["userId"] = user.id; // For admin to get any order while user get their order

  const order = await Order.findOne(queries).lean<OrderPlusItems>();
  if (!order)
    throw new AppError(
      ErrorCodes.ORDER_NOT_FOUND,
      "Order not found.",
      404,
      true,
      null,
    );

  const orderItems: OrderItemInterface[] = await OrderItem.find({
    orderId: order._id,
  });

  order.items = orderItems;
  return order;
};
