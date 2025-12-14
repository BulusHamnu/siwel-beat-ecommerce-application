// import mongoose, { type Date } from "mongoose";
import { Schema, model, Document } from "mongoose";
import { removeUnwantedField, comparePassword } from "../utils/helpers.js";

// user schema types
export interface UserDocument extends Document {
  username: string;
  email: string;
  password: string;
  provider: string;
  role: string;
  isVerified: boolean;
  resetPasswordVerification: {
    code: string | null | number;
    expiredAt: Date | null;
  };
  emailVerification: { code: string | null | number; expiredAt: Date | null };
  google: {
    googleId: string;
    idToken: string;
    accessToken: string;
  };
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;

  // methods
  comparePassword(password: string): Promise<boolean>;
  removeUnwantedField<T>(): T;
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
    google: {
      googleId: String,
      idToken: String,
      accessToken: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// method to compare password
userSchema.methods.comparePassword = comparePassword;

// method to remove secret fields
userSchema.methods.removeUnwantedField = removeUnwantedField;

// user model
const User = model<UserDocument>("User", userSchema);
export default User;
