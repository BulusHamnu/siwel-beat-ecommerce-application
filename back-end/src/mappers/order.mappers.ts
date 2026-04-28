import type { OrderPlusItems } from "../services/shared/ordersShared.service.js";

export interface OrderItemResponse {
  productId: string;
  name: string;
  license: string;
  price: number;
  type: string;
  status: string;
  refundedAt: Date | null;
  updatedAt: Date;
}

export interface OrderResponse {
  id: string;
  transactionId: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  paymentProvider: string;
  refundedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItemResponse[];
  user?: {
    id: string;
    username: string;
    email: string;
    isVerified: boolean;
  };
  userId: string;
}

/* Order response mapper */
export function toOrderResponse(order: OrderPlusItems): OrderResponse {
  const orderItems = order.items;
  let items: OrderItemResponse[] = [];

  if (orderItems && orderItems.length > 0) {
    items = orderItems.map((item) => {
      return {
        productId: String(item.productId),
        name: item.name,
        license: item.license,
        price: item.price,
        type: item.type,
        status: item.status,
        refundedAt: item.refundedAt,
        updatedAt: item.updatedAt,
      };
    });
  }

  //   if (order.userId && typeof order.userId === "object") {
  //     orderRes.user = {
  //       id: String(order.userId?._id),
  //       username: order.userId?.username,
  //       email: order.userId?.email,
  //       isVerified: order.userId?.isVerified,
  //     };
  //   }

  return {
    id: String(order._id),
    transactionId: String(order.transactionId),
    amount: order.amount,
    currency: order.currency,
    status: order.status,
    paymentMethod: order.paymentMethod,
    paymentProvider: order.paymentProvider,
    refundedAt: order.refundedAt,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    userId: String(order.userId),
    items: items,
  };
}

export function toOrdersResponse(orders: OrderPlusItems[]): OrderResponse[] {
  return orders.map((order) => {
    return toOrderResponse(order);
  });
}
