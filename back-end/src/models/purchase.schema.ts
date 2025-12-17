import type { Document, ObjectId } from "mongoose";
import mongoose from "mongoose";

export interface PurchaseInterface extends Document {
  userId: ObjectId;
  trackId: ObjectId;
  type: string;
  orderId: ObjectId;
  amount: number;
}

const purchase = new mongoose.Schema<PurchaseInterface>(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "User",
    },
    trackId: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "Track",
    },
    type: {
      type: String,
      required: true,
      enum: ["basic", "premium"],
    },
    orderId: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "Order",
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const Purchase = mongoose.model<PurchaseInterface>("Purchase", purchase);
export default Purchase;
