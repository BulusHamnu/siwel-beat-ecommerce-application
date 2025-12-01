import { model, Schema, Document } from "mongoose";

export interface newsletterInterface extends Document {
  email: string;
  subscribed: boolean;
  token: string;
  createdAt: Date;
}

const newsletter = new Schema<newsletterInterface>(
  {
    email: { type: String, required: true, unique: true },
    subscribed: { type: Boolean, default: true },
    token: { type: String, required: true },
  },
  { timestamps: true }
);

const Newsletter = model<newsletterInterface>("Newsletter", newsletter);
export default Newsletter;
