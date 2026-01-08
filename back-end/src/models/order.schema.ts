import type { Document, ObjectId } from "mongoose";
import mongoose from "mongoose";

export enum Status {
  paid = "paid",
  failed = "failed",
  pending = "pending",
  disputed = "disputed",
  refunded = "refunded",
  cancelled = "cancelled",
  chargeback = "chargeback",
}

export interface OrderInterface extends Document {
  transactionId: string;
  amount: number;
  currency: string;
  status: Status;
  userId: ObjectId;
  paymentMethod: string;
  paymentProvider: string;
  notes: string;
  refundedAt: Date | null;
}

const order = new mongoose.Schema<OrderInterface>(
  {
    transactionId: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(Status),
      default: Status.pending,
    },
    paymentMethod: {
      type: String,
      default: "card",
    },
    paymentProvider: {
      type: String,
      default: "stripe",
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    notes: String,
    refundedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

/* Indexes */
order.index({ userId: 1, createdAt: -1 });
order.index({ userId: 1, createdAt: -1, status: 1 });

const Order = mongoose.model<OrderInterface>("Order", order);
export default Order;
