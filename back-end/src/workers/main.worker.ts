import { type Job, Worker } from "bullmq";
import env from "../configs/env.js";
import logger from "../utils/logger.js";

const mainWorkerprocessor = async (job: Job) => {
  logger.info(job.name);
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
