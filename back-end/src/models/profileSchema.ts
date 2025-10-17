import mongoose, { type Date } from "mongoose";
import { Types, Document, Schema, Model, model } from "mongoose";

export interface cartInterface {
  productId: Types.ObjectId;
  amount: number;
  quantity: number;
}

// user schema types
export interface ProfileDocument extends Document {
  userId: Types.ObjectId;
  firstName: string;
  lastName: string;
  gender: string;
  bio: string;
  carts: cartInterface[];
  profilePic: string;
  createdAt: Date;
  updatedAt: Date;
  notification: {
    emailNotification: {
      commentAndLIkes: boolean;
    };
  };
}

// user schema
const profileSchema = new Schema<ProfileDocument>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userModel",
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
    bio: {
      type: String,
      default: "",
    },
    carts: [
      {
        productId: {
          type: Types.ObjectId,
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
        commentAndLIkes: {
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
