// import mongoose, { type Date } from "mongoose";
import { Schema, model } from "mongoose";
import baseSchema, { type baseSchemaInterface } from "./common/baseSchema.js";
import { removeUnwantedField, comparePassword } from "../utils/helpers.js";

// user schema types
export interface UserDocument extends baseSchemaInterface {
  stripeId: string;
}

// user schema
const userSchema = new Schema<UserDocument>(
  {
    stripeId: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// add base schema
userSchema.add(baseSchema.obj as any);

// method to compare password
userSchema.methods.comparePassword = comparePassword;

// method to remove secret fields
userSchema.methods.removeUnwantedField = removeUnwantedField;

// user model
const userModel = model<UserDocument>("User", userSchema);
export default userModel;
