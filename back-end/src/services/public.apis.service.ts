import * as NotificationService from "./notification.service.js";
import Template from "../utils/emailTemplate.js";
import env from "../configs/env.js";
import sendEmail from "./sendEmail.js";

/* Send message to admin email */
export const sendMessage = async (data: any): Promise<void> => {
  await sendEmail(
    env.ADMIN_EMAIL,
    "New Message From Siwel Beatz App",
    Template.contactMeTemplate(data)
  );
  await NotificationService.notifyAdmins(
    "New message from contact form, check your email.",
    "MESSAGE_RECEIVED"
  );
};
