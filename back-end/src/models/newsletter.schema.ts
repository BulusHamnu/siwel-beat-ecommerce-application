import { model, Schema, Document } from "mongoose";

export interface NewsletterInterface extends Document {
  email: string;
  subscribed: boolean;
  token: string;
  createdAt: Date;
}

const newsletter = new Schema<NewsletterInterface>(
  {
    email: { type: String, required: true, unique: true },
    subscribed: { type: Boolean, default: true },
    token: { type: String, required: true },
  },
  { timestamps: true }
);

/* indexes */
newsletter.index({ subscribed: 1 });

const Newsletter = model<NewsletterInterface>("Newsletter", newsletter);
export default Newsletter;
