import { Schema, model, Document } from "mongoose";
import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";
import env from "../configs/env.js";

/* User type */
export interface UserInterface extends Document {
  username: string;
  email: string;
  password: string;
  provider: string;
  role: string;
  isVerified: boolean;
  resetPasswordVerification: {
    otpCode: string | null | number;
    otpExpiresAt: Date | null;
    resetToken: string | null | number;
    resetTokenExpiresAt: Date | null;
  };
  emailVerification: { code: string | null | number; expiresAt: Date | null };
  google: {
    googleId: string;
    accessToken: string;
  };
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;

  // methods
  comparePassword(password: string): Promise<boolean>;
  removeUnwantedField<T>(): T;
  signToken(type: string, expiresIn: string): string;
}

/* User schema */
const userSchema = new Schema<UserInterface>(
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
      default: "User",
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
      expiresAt: { type: Date, default: null },
    },
    resetPasswordVerification: {
      otpCode: { type: String, default: "" },
      otpExpiresAt: { type: Date, default: null },
      resetToken: { type: String, default: "" },
      resetTokenExpiresAt: { type: Date, default: null },
    },
    google: {
      googleId: String,
      accessToken: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

/* Schema methods */
userSchema.methods.comparePassword = async function (
  this: Document & { toObject(): any },
  password: string,
): Promise<boolean> {
  const obj = this.toObject();
  return await bcrypt.compare(password, obj.password);
};

userSchema.methods.removeUnwantedField = function <
  T extends Document & { toObject(): any },
>(this: T): T {
  const obj = this.toObject();
  delete obj.resetPasswordVerification;
  delete obj.emailVerification;
  delete obj.password;
  delete obj.google;
  return obj;
};

/* token signing function */
userSchema.methods.signToken = function (
  this: UserInterface,
  type: string,
  expiresIn: any = "24h",
): string {
  const secret =
    type === "accessToken" ? env.TOKEN_SECRET : env.REFRESH_TOKEN_SECRET;

  const token: string = jwt.sign(
    {
      id: this._id,
      email: this.email,
      role: this.role,
      isActive: this.isActive,
      type,
    },
    secret,
    { expiresIn },
  );

  return token;
};

/* Indexes */
// userSchema.index({ role: 1, isActive: 1 });
userSchema.index(
  { "google.googleId": 1 },
  { unique: true, partialFilterExpression: { $exists: true } },
);

const User = model<UserInterface>("User", userSchema);
export default User;
