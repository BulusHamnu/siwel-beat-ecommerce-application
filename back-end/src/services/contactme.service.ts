import Template from "../utils/emailTemplate.js";
import env from "../configs/env.js";
import sendEmail from "./sendEmail.js";
import { type ContactMeReqBody } from "../controllers/contactme.controller.js";

/* Send message to admin email */
export const sendMessage = async (data: ContactMeReqBody): Promise<void> => {
  await sendEmail(
    env.ADMIN_EMAIL,
    "New Message From Siwel Beatz App",
    Template.contactMeTemplate(data),
  );
};
