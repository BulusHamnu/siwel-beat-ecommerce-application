import nodemailer from "nodemailer";
import env from "../configs/env.js";
import logger from "../utils/logger.js";

const transport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASSWORD,
  },
});

const sendEmail = async (
  receiver: string,
  subject: string,
  template: string = ""
): Promise<boolean | undefined> => {
  try {
    await transport.sendMail({
      from: `"${env.APP_NAME}" <${env.ADMIN_EMAIL}>`,
      to: receiver,
      subject,
      html: template,
    });
    logger.info(`Email sucessfully sent to ${receiver}`);
    return true;
  } catch (error) {
    logger.error(
      `An error occured while sending email to: user: ${receiver}`,
      error
    );
  }
};

export default sendEmail;
