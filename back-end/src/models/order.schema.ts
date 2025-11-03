import type { Document, ObjectId } from "mongoose";
import mongoose from "mongoose";

enum Status {
  paid = "paid",
  unpaid = "unpaid",
  failed = "failed",
  pending = "pending",
}

export interface Order extends Document {
  transactionId: string;
  amount: number;
  status: Status;
  products: string[];
  date: Date;
  userId: ObjectId;
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
    status: {
      type: String,
      enum: ["paid", "unpaid", "failed", "pending"],
    },
    products: [mongoose.Schema.ObjectId],
    date: {
      type: Date,
      default: Date.now,
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Order = mongoose.model<Order>("Order", order);
export default Order;
