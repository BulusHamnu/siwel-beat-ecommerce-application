import Newsletter, {
  type newsletterInterface,
} from "../models/newsletter.schema.js";
import AppError from "../errors/appError.js";
import sendEmail from "./sendEmail.js";
import Template from "../utils/emailTemplate.js";
import crypto from "crypto";

// SUBCRIBTION SERVICE
export const subscribeToNewsletter = async (email: string): Promise<void> => {
  const subExist: newsletterInterface | null = await Newsletter.findOne({
    email,
  });

  let token: string = "";
  if (subExist && subExist.subscribed) {
    throw new AppError("Email is already subscribed.", 409, true);
  } else if (subExist && !subExist.subscribed) {
    token = crypto.randomBytes(24).toString("hex");
    subExist.subscribed = true;
    subExist.token = token;
    await subExist.save();
  } else {
    token = crypto.randomBytes(24).toString("hex");
    await Newsletter.create({ email, subscribed: true, token });
  }

  await sendEmail(
    email,
    "You're Now on the List 🎉",
    Template.newsletterSubscriptionNotification(email, token)
  );
};

// UNSUBSCRIPE SERVICE
export const unsubscribeFromNewsletter = async (
  email: string,
  token: string
): Promise<void> => {
  const unsubscribed = await Newsletter.findOneAndUpdate(
    { email, token },
    { subscribed: false },
    { new: true }
  );

  if (!unsubscribed)
    throw new AppError("Unable to unsubscribe user", 500, false);

  await sendEmail(
    email,
    "You’re Off the List",
    Template.newsletterUnsubscriptionNotification()
  );
};
