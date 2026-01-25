import Newsletter, {
  type NewsletterInterface,
} from "../models/newsletter.schema.js";
import AppError, { ErrorCodes } from "../errors/appError.js";
import sendEmail from "./sendEmail.js";
import Template from "../utils/emailTemplate.js";
import crypto from "crypto";
import * as NotificationService from "./notification.service.js";

/* Subcribe to news letter */
async function addToList(
  email: string,
): Promise<{ token: string; sub: NewsletterInterface }> {
  let sub: NewsletterInterface | null = null;
  const subExist: NewsletterInterface | null = await Newsletter.findOne({
    email,
  });

  let token: string = "";
  if (subExist && subExist.subscribed) {
    throw new AppError(
      ErrorCodes.EMAIL_ALREADY_SUBSCRIBED,
      "Email is already subscribed.",
      409,
      true,
      { email },
    );
  } else if (subExist && !subExist.subscribed) {
    token = crypto.randomBytes(24).toString("hex");
    subExist.subscribed = true;
    subExist.token = token;
    sub = await subExist.save();
  } else {
    token = crypto.randomBytes(24).toString("hex");
    sub = await Newsletter.create({ email, subscribed: true, token });
  }

  return { token, sub };
}

export const subscribeToNewsletter = async (email: string): Promise<void> => {
  const { token, sub } = await addToList(email);
  await sendEmail(
    email,
    "You're Now on the List 🎉",
    Template.newsletterSubscriptionNotification(email, token),
  );

  await NotificationService.notifyAdmins(
    "Hurray! Someone just join the newsletter.",
    "NEWSLETTER_SUBSCRIBED",
    sub._id as string,
  );
};

/*  Unsubscribe from news letter */
export const unsubscribeFromNewsletter = async (
  email: string,
  token: string,
): Promise<void> => {
  const unsubscribed = await Newsletter.findOneAndUpdate(
    { email, token, subscribed: true },
    { $set: { subscribed: false, token: null } },
    { new: true },
  );

  if (!unsubscribed)
    throw new AppError(
      ErrorCodes.NEWSLETTER_SUBSCRIPTION_ERROR,
      "Unable to unsubscribe user",
      500,
      false,
      null,
    );

  await sendEmail(
    email,
    "You’re Off the List",
    Template.newsletterUnsubscriptionNotification(),
  );
};
