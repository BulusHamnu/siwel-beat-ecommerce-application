import env from "../configs/env.js";
type template = (userName: string, code?: string | number | null) => string;

type contactTemplate = ({
  name,
  email,
  subject,
  message,
}: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) => string;

interface emailTemplate {
  emailVerificationTemplate: template;
  resetPasswordTemplate: template;
  resetSuccessfulTemplate: template;
  contactMeTemplate: contactTemplate;
  newsletterSubscriptionNotification: (email: string, token: string) => string;
  newsletterUnsubscriptionNotification: () => string;
}

const Template: emailTemplate = {
  emailVerificationTemplate: (userName, code = "") => {
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            @import url("https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap");
          </style>
        </head>
        <body
          style="
            border: 2px solid #a7a6ad;
            padding: 1.5rem;
            border-radius: 0.5rem;
            max-width: 750px;
          "
        >
          <p style="font-family: Helvetica, Arial, sans-serif">Hi, ${userName}</p>
          <p style="font-family: Helvetica, Arial, sans-serif">
            Please use this code to verify you email,
          </p>
          <p style="font-family: Helvetica, Arial, sans-serif; font-size: 1.5rem;">
            ${code}
          </p>
          <p></p>
          <p style="font-family: Helvetica, Arial, sans-serif">
            <small>This code will expire in 15 min.</small>
          </p>
          <div
            style="
              height: 1px;
              width: 100%;
              background-color: #a7a6ad;
              color: #a7a6ad;
            "
          ></div>
          <p style="font-family: Helvetica, Arial, sans-serif">
            <small>If you didn't request this, you can ignore this email.</small>
          </p>
        </body>
      </html>
    `;
  },
  resetPasswordTemplate: (userName, code = "") => {
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            @import url("https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap");
          </style>
        </head>
        <body
          style="
            border: 2px solid #a7a6ad;
            padding: 1.5rem;
            border-radius: 0.5rem;
            max-width: 750px;
          "
        >
          <h2>Did you request to reset your password?</h2>
          <p style="font-family: Helvetica, Arial, sans-serif">Hi, ${userName}</p>
          <p style="font-family: Helvetica, Arial, sans-serif">
            Use the code below to reset your password
          </p>
          <p style="font-family: Helvetica, Arial, sans-serif; font-size: 1.5rem">
            ${code}
          </p>
          <p></p>
          <p style="font-family: Helvetica, Arial, sans-serif">
            <small>This code will expire in 15 min.</small>
          </p>
          <div
            style="
              height: 1px;
              width: 100%;
              background-color: #a7a6ad;
              color: #a7a6ad;
            "
          ></div>
          <p style="font-family: Helvetica, Arial, sans-serif">
            <small>If you didn't request this, you can ignore this email.</small>
          </p>
        </body>
      </html>
    `;
  },
  resetSuccessfulTemplate: (userName) => {
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            @import url("https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap");
          </style>
        </head>
        <body
          style="
            border: 2px solid #a7a6ad;
            padding: 1.5rem;
            border-radius: 0.5rem;
            max-width: 750px;
          "
        >
          <p style="font-family: Helvetica, Arial, sans-serif">Hi, ${userName}</p>
          <p style="font-family: Helvetica, Arial, sans-serif">
            Your password have been reset successful, you can login now.
          </p>
          <button
            style="
              padding: 0.5rem 2rem;
              font-family: Helvetica, Arial, sans-serif;
              background-color: #040733;
              border-radius: 2px;
              border: none;
            "
          >
            <a style="color: white" target="_blank" href="${`${env.FRONTEND_URL}/auth/login`}"
              >Login</a
            >
          </button>
        </body>
      </html>
    `;
  },
  contactMeTemplate: ({ name, email, subject = "", message }) => {
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            @import url("https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap");
          </style>
        </head>
        <body
          style="
            border: 2px solid #a7a6ad;
            padding: 1.5rem;
            border-radius: 0.5rem;
            max-width: 750px;
          "
        >
          <p style="font-family: Helvetica, Arial, sans-serif">
            Hi Siwel beatz, you received a new message.
          </p>
          <p style="font-family: Helvetica, Arial, sans-serif">
            <span style="font-weight: 700">Name:</span> ${name}.
          </p>
          <div
            style="
              height: 1px;
              width: 100%;
              background-color: #a7a6ad;
              color: #a7a6ad;
            "
          ></div>
          <p style="font-family: Helvetica, Arial, sans-serif">
            <span style="font-weight: 700">Email:</span> ${email}.
          </p>
          <div
            style="
              height: 1px;
              width: 100%;
              background-color: #a7a6ad;
              color: #a7a6ad;
            "
          ></div>
          ${
            subject
              ? `
          <p style="font-family: Helvetica, Arial, sans-serif">
            <span style="font-weight: 700">Subject:</span> ${subject}.
          </p>
          `
              : ""
          }
          <div
            style="
              height: 1px;
              width: 100%;
              background-color: #a7a6ad;
              color: #a7a6ad;
            "
          ></div>
          <p style="font-family: Helvetica, Arial, sans-serif">
            <span style="font-weight: 700">Message:</span> ${message}.
          </p>
        </body>
      </html>
    `;
  },
  newsletterSubscriptionNotification: (email: string, token: string) => {
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            @import url("https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap");
          </style>
        </head>
        <body
          style="
            border: 2px solid #a7a6ad;
            padding: 1.5rem;
            border-radius: 0.5rem;
            max-width: 750px;
          "
        >
          <p style="font-family: Helvetica, Arial, sans-serif">Hi there,</p>
          <p style="font-family: Helvetica, Arial, sans-serif">
            Thank you for subscribing to our newsletter! You'll be among the first to
            receive updates on my latest uploads, releases, and exclusive goodies.
          </p>
          <div
            style="
              height: 1px;
              width: 100%;
              background-color: #a7a6ad;
              color: #a7a6ad;
            "
          ></div>
          <p style="font-family: Helvetica, Arial, sans-serif">
            <small
              >If you didn't perform this action and believe this is a mistake, you
              can click on this to <a href="${env.BACKEND_URL}/api/v1/news-letter/unsubscribe?email=${email}&token=${token}">unsubscribe</a>.</small
            >
          </p>
        </body>
      </html>
    `;
  },
  newsletterUnsubscriptionNotification: () => {
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            @import url("https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap");
          </style>
        </head>
        <body
          style="
            border: 2px solid #a7a6ad;
            padding: 1.5rem;
            border-radius: 0.5rem;
            max-width: 750px;
          "
        >
          <p style="font-family: Helvetica, Arial, sans-serif">Hi there,</p>
          <p style="font-family: Helvetica, Arial, sans-serif">
            Your email has been successfully removed from our mailing list. You won’t
            receive any more messages from us.
          </p>
          <div
            style="
              height: 1px;
              width: 100%;
              background-color: #a7a6ad;
              color: #a7a6ad;
            "
          ></div>
          <p style="font-family: Helvetica, Arial, sans-serif">
            <small
              >If this was a mistake, you can
            resubscribe anytime. Thank you for being part of our community.</small
            >
          </p>
        </body>
      </html>
    `;
  },
};

export default Template;
