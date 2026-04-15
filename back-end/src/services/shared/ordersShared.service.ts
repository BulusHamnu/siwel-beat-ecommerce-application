import { getDateRange } from "../../utils/helpers.js";
import Order, { type OrderInterface } from "../../models/order.schema.js";
import { type Pagination } from "../../controllers/responseInterface.js";
import AppError, { ErrorCodes } from "../../errors/appError.js";
import type { userPayload } from "../../middlewares/requiredAuth.js";
import OrderItem, {
  type OrderItemInterface,
} from "../../models/orderItem.schema.js";
import type { CartItem } from "../../models/cart.schema.js";
import logger from "../../utils/logger.js";

/* Create order */
export async function createOrder(orderItems: CartItem[]) {
  logger.info("OrderItems", { orderItems });

  throw new AppError(
    "NOT_IMPLEMENTED",
    "Checkout is not available yet.",
    501,
    true,
    null,
  );
}

export interface Queries {
  status?: string;
  userId?: string;
  createdAt?: any;
}

/* Construt order queries function */
function buildQueries(status: string, date: string, userId?: string): Queries {
  const queries: Queries = {};

  // Filter orders
  if (userId) queries["userId"] = userId;
  if (status) queries["status"] = status.toLowerCase();
  if (date) {
    const { start, end } = getDateRange(date);
    queries["createdAt"] = { $gte: start, $lte: end };
  }

  return queries;
}

/* get orders and order document counts  */
export async function getOrdersAndCount(
  skip: number,
  limit: number,
  queries: Queries,
): Promise<{
  ordersCounts: number;
  ordersWithOverhead: OrderInterface[];
}> {
  // Get how many orders they are and to get all orders
  const orderCountQuery = Order.find(queries).countDocuments();
  const OrdersQuery = Order.find(queries)
    .skip(skip)
    .limit(limit + 1) // Show if there is more
    .sort({ createdAt: -1 })
    .lean<OrderInterface[]>();

  const [ordersCounts, ordersWithOverhead] = await Promise.all([
    orderCountQuery,
    OrdersQuery,
  ]);

  return { ordersCounts, ordersWithOverhead };
}

/* Get all orders */
export interface OrderPlusItems extends OrderInterface {
  // _id: Types.ObjectId;
  items?: OrderItemInterface[];
}

async function attachItemsToOrders(
  orders: OrderInterface[],
): Promise<OrderPlusItems[]> {
  const orderMap = new Map<string, any>();

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
    order.items.push(item);
  });

  return [...orders];
}

export interface orderResult {
  orders: OrderPlusItems[];
  pagination: Pagination;
}

export const getAllOrders = async (
  page: number,
  limit: number,
  status: string,
  date: string,
  userId: string = "",
): Promise<orderResult> => {
  const skip = (page - 1) * limit; // calculate skip

  const queries = buildQueries(status, date, userId);
  const { ordersCounts, ordersWithOverhead } = await getOrdersAndCount(
    skip,
    limit,
    queries,
  );

  const hasNext = ordersWithOverhead.length > limit;
  const totalPage = Math.ceil(ordersCounts / limit);
  const ordersX = ordersWithOverhead.slice(0, limit);

  const orders = await attachItemsToOrders(ordersX); //
  return {
    orders,
    pagination: {
      page,
      limit,
      hasNext,
      totalPage,
    },
  } as orderResult;
};

/* Get order */
export const getOrder = async (
  id: string,
  user: userPayload,
): Promise<OrderPlusItems> => {
  const queries: { _id: string; userId?: string } = {
    _id: id,
  };

  if (user.role === "user") queries["userId"] = user.id; // For admin to get any order while user get their order

  const order: OrderInterface | null = await Order.findOne(queries);
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

  const orderObj: OrderPlusItems = order.toObject();
  orderObj.items = orderItems;

  return orderObj;
};
