import mongoose, { type Date, type ObjectId } from "mongoose";
import { Document, Schema, Model, model } from "mongoose";

/* Profile type */
export interface ProfileInterface extends Document {
  userId: ObjectId;
  firstName: string;
  lastName: string;
  gender: string;
  bio: string;
  avatar: string;
  avatarPath: string;
  createdAt: Date;
  updatedAt: Date;
  lemonSqueezyId: string;
  notification: {
    emailNotification: {
      commentAndLikes: boolean;
      orders: boolean;
    };
  };
}

/* Profile schema */
const profileSchema = new Schema<ProfileInterface>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    firstName: {
      type: String,
      min: 3,
      default: null,
    },
    lastName: {
      type: String,
      min: 3,
      default: null,
    },
    gender: {
      type: String,
      enum: ["male", "female", "not-specified"],
      default: "not-specified",
    },
    lemonSqueezyId: {
      type: String,
    },
    bio: {
      type: String,
      default: "",
    },
    avatar: {
      type: String,
      default: "",
    },
    avatarPath: {
      type: String,
      default: "",
    },
    notification: {
      emailNotification: {
        commentAndLikes: {
          type: Boolean,
          default: false,
        },
        orders: {
          type: Boolean,
          default: false,
        },
      },
    },
  },
  { timestamps: true },
);

/* Index */
profileSchema.index({ userId: 1 }, { unique: true });
profileSchema.index(
  { lemonSqueezyId: 1 },
  { unique: true, partialFilterExpression: { $exists: true } },
);

// user model
const profileModel = model<ProfileInterface>("Profile", profileSchema);
export default profileModel;
