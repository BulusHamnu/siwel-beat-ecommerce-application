import { getDateRange } from "../../utils/helpers.js";
import Order, { type OrderInterface } from "../../models/order.schema.js";
import { type Pagination } from "../../controllers/responseInterface.js";

export interface Queries {
  status?: string;
  userId?: string;
  createdAt?: any;
}

/* Construt order querie function */
export function constructQueries(
  status: string,
  date: string,
  userId?: string
): Queries {
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
  queries: Queries
): Promise<{ ordersCounts: number; ordersWithOverhead: OrderInterface[] }> {
  // Get how many orders they are and to get all orders
  const orderCountQuery = Order.find(queries).countDocuments();
  const OrdersQuery = Order.find(queries)
    .skip(skip)
    .limit(limit + 1) // Show if there is more
    .sort({ createdAt: -1 })
    .populate(
      "products",
      "title basicPrice premiumPrice description type key status bpm tags genre _id"
    );

  const [ordersCounts, ordersWithOverhead] = await Promise.all([
    orderCountQuery,
    OrdersQuery,
  ]);

  return { ordersCounts, ordersWithOverhead };
}

/* Get all orders */
export interface orderResult {
  orders: OrderInterface[];
  pagination: Pagination;
}
export const getAllOrders = async (
  page: number,
  limit: number,
  status: string,
  date: string,
  userId: string = ""
): Promise<orderResult> => {
  const skip = (page - 1) * limit; // calculate skip

  const queries = constructQueries(status, date, userId);
  const { ordersCounts, ordersWithOverhead } = await getOrdersAndCount(
    skip,
    limit,
    queries
  );

  // For easy navigation through orders
  const hasNext = ordersWithOverhead.length > limit;
  const totalPage = Math.ceil(ordersCounts / limit);
  const orders = ordersWithOverhead.slice(0, limit);

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
