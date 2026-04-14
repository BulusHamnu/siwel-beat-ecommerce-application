import mongoose, { Schema, model, Document, type ObjectId } from "mongoose";

/* Session type */
export interface SessionInterface extends Document {
  userId: String | ObjectId;
  refreshToken: string;
  expiresAt: Date;
  deviceInfo: string;
  lastUsed: Date;
  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema = new Schema<SessionInterface>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    expiresAt: { type: Date, required: true },
    deviceInfo: { type: String, default: null },
    lastUsed: { type: Date, required: true },
  },
  { timestamps: true },
);

/* Indexes */
sessionSchema.index({ userId: 1 });
sessionSchema.index({ refreshToken: 1 });

const Session = model<SessionInterface>("Session", sessionSchema);
export default Session;
