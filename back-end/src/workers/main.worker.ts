import { type Job, Worker } from "bullmq";
import env from "../configs/env.js";
import logger from "../utils/logger.js";
import connectDb from "../configs/db.js";
import sendEmail from "../services/sendEmail.js";
import Template from "../utils/emailTemplate.js";
import supabase from "../services/supabase.js";
import {
  postNewNotification,
  notifyAdmins,
} from "../services/notification.service.js";
import { sendCommentNotification } from "../services/tracks/trackComments.service.js";

/* Main worker processor*/
export const mainWorkerprocessor = async (job: Job) => {
  const name = job.name;
  const data = job.data;

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

    case "send-newsletter-subscribed-email": {
      const { to, message, token } = data;
      await sendEmail(
        to,
        message,
        Template.newsletterSubscriptionNotification(to, token),
      );
      break;
    }

    case "send-newsletter-unsubscribed-email": {
      const { to, message } = data;
      await sendEmail(
        to,
        message,
        Template.newsletterUnsubscriptionNotification(),
      );
      break;
    }

    case "password-reset-confirmation": {
      const { to, message, username } = data;
      await sendEmail(to, message, Template.resetSuccessfulTemplate(username));
      break;
    }

    case "delete-track-files": {
      const { paths } = data;
      await supabase.safeRemoveTrackFiles(paths);
      break;
    }

    case "delete-files": {
      const { bucket, paths } = data;
      await supabase.deleteFiles(bucket, paths);
      break;
    }

    case "post-notification": {
      const { userId, message, type, resourceId, entityId } = data;
      if (!userId) {
        await notifyAdmins(message, type, resourceId, entityId);
        break;
      }

      await postNewNotification({
        userId,
        message,
        type,
        resourceId,
        entityId,
      });
      break;
    }

    case "send-comments-notification": {
      const { type, targetUserId, actorUserId, resourceId, entityId } = data;

      await sendCommentNotification({
        type,
        targetUserId,
        actorUserId,
        resourceId,
        entityId,
      });
      break;
    }

    default: {
      logger.debug(`Unidentified Job: ${name}`);
      break;
    }
  }
};

/* Worker config */
export const workerConfigs = {
  opts: {
    prefix: "siwelbeat-app",
    connection: env.REDIS_CONNECTION,
    concurrency: 5,
  },
  jobCompletedCallbackFunc: (job: Job) => {
    const data = job.data;
    logger.info(`${job.name} - job was executed successfully`, data);
  },
  jobFailedCallbackFunc: (job: Job | undefined) => {
    const data = job?.data;
    logger.error(`An error occured while executing - ${job?.name} job.`, data);
  },
  onReadyCallbackFunc: () => logger.info("Worker is ready"),
};
