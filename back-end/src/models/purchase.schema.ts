import type { Document, ObjectId } from "mongoose";
import mongoose from "mongoose";
import { LicenseType } from "./license.schema.js";

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
      enum: Object.values(LicenseType),
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
  { timestamps: true },
);

/* Indexes */
purchase.index({ userId: 1, createdAt: -1 });
purchase.index({ userId: 1, orderId: 1 });
purchase.index({ userId: 1, trackId: 1, type: 1 }, { unique: true });

const Purchase = mongoose.model<PurchaseInterface>("Purchase", purchase);
export default Purchase;
