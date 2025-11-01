import mongoose, { type Date, type ObjectId } from "mongoose";
import { Document, Schema, Model, model } from "mongoose";

export interface cartInterface {
  productId: ObjectId;
  amount: number;
  quantity: number;
}

// user schema types
export interface ProfileDocument extends Document {
  userId: ObjectId;
  firstName: string;
  lastName: string;
  gender: string;
  bio: string;
  carts: cartInterface[];
  profilePic: string;
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
    carts: [
      {
        productId: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
    profilePic: {
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
