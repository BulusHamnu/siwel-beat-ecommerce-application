import { Schema, model } from "mongoose";
import baseSchema, { type baseSchemaInterface } from "./common/baseSchema.js";
import { removeUnwantedField, comparePassword } from "../utils/helpers.js";

// admin schema
export interface AdminDocument extends Document, baseSchemaInterface {}

const adminSchema = new Schema<AdminDocument>({}, { timestamps: true });

// add base schema
adminSchema.add(baseSchema.obj as any);

// method to compare password
adminSchema.methods.comparePassword = comparePassword;

// method to remove secret fields
adminSchema.methods.removeUnwantedField = removeUnwantedField;

// user model
const adminModel = model<AdminDocument>("Admin", adminSchema);
export default adminModel;
