import type { Document, ObjectId } from "mongoose";
import mongoose from "mongoose";

enum Status {
  paid = "paid",
  failed = "failed",
  pending = "pending",
}

export interface Order extends Document {
  transactionId: string;
  amount: number;
  currency: string;
  status: Status;
  products: string[];
  userId: ObjectId;
  paymentMethod: string;
  paymentProvider: string;
  notes: string;
}

const order = new mongoose.Schema<Order>(
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
      enum: ["paid", "failed", "pending"],
    },
    products: [mongoose.Schema.ObjectId],
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
  },
  { timestamps: true }
);

const Order = mongoose.model<Order>("Order", order);
export default Order;
