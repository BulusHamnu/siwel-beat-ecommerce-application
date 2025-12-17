import mongoose, { type Date, type ObjectId } from "mongoose";
import { Document, Schema, Model, model } from "mongoose";

export interface CartItem {
  productId: ObjectId;
  name: string;
  license: string;
  price: number;
  type: string;
}

// user schema types
export interface ProfileDocument extends Document {
  userId: ObjectId;
  firstName: string;
  lastName: string;
  gender: string;
  bio: string;
  cart: CartItem[];
  picture: string;
  createdAt: Date;
  updatedAt: Date;
  stripeId: string;
  notification: {
    emailNotification: {
      commentAndLikes: boolean;
    };
  };
}

// user schema
const profileSchema = new Schema<ProfileDocument>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    firstName: {
      type: String,
      min: 3,
      default: "",
    },
    lastName: {
      type: String,
      min: 3,
      default: "",
    },
    gender: {
      type: String,
      enum: ["male", "female", "not-specified"],
      default: "not-specified",
    },
    stripeId: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    cart: [
      {
        productId: {
          type: mongoose.Schema.ObjectId,
          ref: "Track",
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
    picture: {
      type: String,
      default: "",
    },
    notification: {
      emailNotification: {
        commentAndLikes: {
          type: Boolean,
          default: false,
        },
      },
    },
  },
  { timestamps: true }
);

// user model
const profileModel = model<ProfileDocument>("Profile", profileSchema);
export default profileModel;
