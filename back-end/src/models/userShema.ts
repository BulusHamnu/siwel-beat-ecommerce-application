// import mongoose, { type Date } from "mongoose";
import { Types, Document, Schema, Model, model } from "mongoose";
import bcrypt from "bcrypt";

// user schema types
export interface UserDocument extends Document {
  username: string;
  email: string;
  password: string;
  stripeId: string;
  provider: string;
  role: string;
  isVerified: boolean;
  resetPasswordVerification?: {
    code: string | null | number;
    exprireAt: Date | null;
  };
  emailVerification: { code: string | null | number; expiredAt: Date | null };
  google: {
    googleId: string;
    openId: string;
    refreshToken: string;
  };
  createdAt: Date;
  updatedAt: Date;
  // methods
  comparePassword(password: string): Promise<boolean>;
  removeUnwantedField(): UserDocument;
}

// user schema
const userSchema = new Schema<UserDocument>(
  {
    username: {
      type: String,
      required: true,
      min: 5,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    stripeId: {
      type: String,
      default: "",
    },
    provider: {
      type: String,
      default: "local",
    },
    role: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    emailVerification: {
      code: {
        type: String,
        default: "",
      },
      expiredAt: { type: Date, default: null },
    },
    resetPasswordVerification: {
      code: { type: String, default: "" },
      expiredAt: { type: Date, default: null },
      default: {},
    },
  },
  { timestamps: true }
);
// method to compare password
userSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

// method to remove secret fields
userSchema.methods.removeUnwantedField = function (): UserDocument {
  const obj = this.toObject();
  delete obj.resetPasswordVerification;
  delete obj.emailVerification;
  delete obj.password;
  return obj;
};

// user model
const userModel = model<UserDocument>("User", userSchema);
export default userModel;
