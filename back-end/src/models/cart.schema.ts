import mongoose, { type ObjectId, model, Schema, Document } from "mongoose";

export enum ItemStatus {
  deleted = "deleted",
  inactive = "inactive",
  priceChanged = "price_changed",
  active = "active",
}

export interface CartItem {
  productId: ObjectId;
  name: string;
  license: string;
  price: number;
  type: string;
}

export interface CartInterface extends Document {
  userId: string | ObjectId;
  items: CartItem[];
  subTotal?: number;
}

const cartSchema = new Schema<CartInterface>(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.ObjectId,
          ref: "Track",
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        license: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true },
);

/* Indexes */
cartSchema.index({ userId: 1 }, { unique: true });

const Cart = model<CartInterface>("Cart", cartSchema);
export default Cart;
