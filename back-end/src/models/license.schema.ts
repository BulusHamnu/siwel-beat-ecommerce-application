import mongoose, { Schema, model, Document, type ObjectId } from "mongoose";

export enum LicenseType {
  basic = "basic",
  premium = "premium",
}

export interface LicenseInterface extends Document {
  trackId: ObjectId;
  basic: string;
  premium: string;
  createdAt: Date;
  updatedAt: Date;
}

/* License schema */
const licenseSchema = new Schema<LicenseInterface>(
  {
    trackId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Track",
      unique: true,
      required: true,
    },
    basic: { type: String, required: true },
    premium: { type: String, required: true },
  },
  { timestamps: true },
);

const License = model<LicenseInterface>("License", licenseSchema);
export default License;
