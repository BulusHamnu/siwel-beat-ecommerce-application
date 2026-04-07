import mongoose, { Schema, model, Document, type ObjectId } from "mongoose";

/* Session type */
export interface Session extends Document {
  userId: String | ObjectId;
  refreshToken: string;
  expiresAt: Date;
  deviceInfo: string;
  lastUsed: Date;
  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema = new Schema<Session>(
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

const Session = model<Session>("Session", sessionSchema);
export default Session;
