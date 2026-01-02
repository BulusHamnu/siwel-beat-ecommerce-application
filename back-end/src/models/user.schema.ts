import { Schema, model, Document } from "mongoose";
import bcrypt from "bcrypt";

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

  // methods
  comparePassword(password: string): Promise<boolean>;
  removeUnwantedField<T>(): T;
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

/* Indexes */
userSchema.index({ role: 1, isActive: 1 });

const User = model<UserInterface>("User", userSchema);
export default User;
