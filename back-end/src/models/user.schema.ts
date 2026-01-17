import { Schema, model, Document } from "mongoose";
import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";
import env from "../configs/env.js";

export interface Session {
  refreshToken: string;
  expiredAt: Date;
  deviceInfo: string;
  lastUsed: Date;
}
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
    otpExpiredAt: Date | null;
    resetToken: string | null | number;
    resetTokenExpiredAt: Date | null;
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
  sessions: Session[];

  // methods
  comparePassword(password: string): Promise<boolean>;
  removeUnwantedField<T>(): T;
  signToken(user: UserInterface, type: string, expiresIn: string): string;
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
      otpCode: { type: String, default: "" },
      otpExpiredAt: { type: Date, default: null },
      resetToken: { type: String, default: "" },
      resetTokenExpiredAt: { type: Date, default: null },
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
    sessions: [
      {
        refreshToken: String,
        expiredAt: Date,
        deviceInfo: String,
        lastUsed: Date,
      },
    ],
  },
  { timestamps: true }
);

/* Schema methods */
userSchema.methods.comparePassword = async function (
  this: Document & { toObject(): any },
  password: string
): Promise<boolean> {
  const obj = this.toObject();
  return await bcrypt.compare(password, obj.password);
};

userSchema.methods.removeUnwantedField = function <
  T extends Document & { toObject(): any }
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
  user: UserInterface,
  type: string,
  expiresIn: any = "24h"
): string {
  const refreshToken: string = jwt.sign(
    {
      id: user._id,
      email: user.email,
      isVerified: user.isVerified,
      role: user.role,
      isActive: user.isActive,
      type,
    },
    env.REFRESH_TOKEN_SECRET,
    { expiresIn }
  );

  return refreshToken;
};

/* Indexes */
userSchema.index({ role: 1, isActive: 1 });

const User = model<UserInterface>("User", userSchema);
export default User;
