import { Schema, model } from "mongoose";
import { type Document } from "mongoose";

export interface baseSchemaInterface extends Document {
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

  // methods
  comparePassword(password: string): Promise<boolean>;
  removeUnwantedField<T>(): T;
}

const baseSchema = new Schema<baseSchemaInterface>({
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
});

export default baseSchema;
