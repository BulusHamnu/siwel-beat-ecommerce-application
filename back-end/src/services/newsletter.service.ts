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
  let sub: any = null;
  let token = crypto.randomBytes(24).toString("hex");

  try {
    sub = await Newsletter.create({ email, subscribed: true, token });
  } catch (error: any) {
    if (error.code !== 11000) throw error;

    const subExist = await Newsletter.findOne({
      email,
    });

    if (subExist && subExist.subscribed) {
      throw new AppError(
        ErrorCodes.EMAIL_ALREADY_SUBSCRIBED,
        "Email is already subscribed.",
        409,
        true,
        { email },
      );
      //
    } else if (subExist) {
      subExist.subscribed = true;
      subExist.token = token;
      sub = await subExist.save();

      return { token, sub };
    }
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
  const updated = await Newsletter.updateOne(
    { email, token, subscribed: true },
    { $set: { subscribed: false, token: null } },
  );

  if (updated.matchedCount !== 1 || updated.modifiedCount !== 1)
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
