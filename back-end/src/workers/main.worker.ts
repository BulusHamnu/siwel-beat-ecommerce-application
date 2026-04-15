import { type Job, Worker } from "bullmq";
import env from "../configs/env.js";
import logger from "../utils/logger.js";
import connectDb from "../configs/db.js";
import sendEmail from "../services/sendEmail.js";
import Template from "../utils/emailTemplate.js";

await connectDb();

const mainWorkerprocessor = async (job: Job) => {
  const name = job.name;
  const data = job.data;
  //
  switch (name) {
    case "send-verification-email": {
      const { to, message, username, code } = data;
      await sendEmail(
        to,
        message,
        Template.emailVerificationTemplate(username, code),
      );
      break;
    }

    case "send-reset-password-email": {
      const { to, message, username, code } = data;
      await sendEmail(
        to,
        message,
        Template.resetPasswordTemplate(username, code),
      );
      break;
    }

    case "password-reset-confirmation": {
      const { to, message, username } = data;
      await sendEmail(to, message, Template.resetSuccessfulTemplate(username));
      break;
    }
  }
};

/* Main worker */
const connection = env.REDIS_CONNECTION;
const mainWorker = new Worker("main-queue", mainWorkerprocessor, {
  prefix: "siwelbeat-app",
  connection,
  concurrency: 5,
});

//
mainWorker.on("completed", (job: Job) => {
  const data = job.data;
  logger.info(`${job.name} - job was executed successfully`, data);
});

mainWorker.on("failed", (job: Job | undefined) => {
  const data = job?.data;
  logger.error(`An error occured while executing - ${job?.name} job.`, data);
});

export default mainWorker;
