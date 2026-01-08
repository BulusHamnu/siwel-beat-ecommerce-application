import type { Document, ObjectId } from "mongoose";
import mongoose from "mongoose";
import { type CartItem } from "./profile.schema.js";
import { Status } from "./order.schema.js";
import { LicenseType } from "./track.schema.js";

export interface OrderItemInterface extends CartItem, Document {
  orderId: ObjectId;
  status: Status;
  refundedAt: Date;
}

export const orderItem = new mongoose.Schema<OrderItemInterface>(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Track",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    license: {
      type: String,
      enum: Object.values(LicenseType),
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(Status),
      default: Status.pending,
    },
    refundedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

/* Indexes */
orderItem.index({ productId: 1 });
orderItem.index({ orderId: 1, productId: 1, status: 1 });

const OrderItem = mongoose.model<OrderItemInterface>("OrderItem", orderItem);
export default OrderItem;
