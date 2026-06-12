import nodemailer from "nodemailer";
import env from "../configs/env.js";
import logger from "../utils/logger.js";
import { Resend } from "resend";

const resend = new Resend(env.RESEND_KEY);

// const transport = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 465,
//   secure: true,
//   auth: {
//     user: env.EMAIL_USER,
//     pass: env.EMAIL_PASSWORD,
//   },
// });

const sendEmail = async (
  receiver: string,
  subject: string,
  template: string = "",
): Promise<void> => {
  // await transport.sendMail({
  //   from: `"${env.APP_NAME}" <${env.ADMIN_EMAIL}>`,
  //   to: receiver,
  //   subject,
  //   html: template,
  // });

  const { data, error } = await resend.emails.send({
    from: `"Siwel Beats App" <no-reply@bulushamnu.com>`,
    to: [receiver],
    subject: subject,
    html: template,
  });

  if (error) {
    logger.error("An error occured while sending email.");
  } else {
    logger.info(`Email sucessfully sent to: ${receiver}`);
  }
};

export default sendEmail;
