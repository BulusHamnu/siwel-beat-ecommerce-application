import mongoose, { Schema, model, Document, type ObjectId } from "mongoose";

export enum LicenseType {
  basic = "basic",
  premium = "premium",
}

export interface License extends Document {
  trackId: ObjectId;
  basic: string;
  premium: string;
}

/* License schema */
const licenseSchema = new Schema<License>({
  trackId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Track",
    required: true,
  },
  basic: { type: String, required: true },
  premium: { type: String, required: true },
});

const License = model<License>("License", licenseSchema);
export default License;
