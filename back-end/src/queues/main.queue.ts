import { Queue } from "bullmq";
import env from "../configs/env.js";

const connection = env.REDIS_CONNECTION;

/* Main queue */
const mainQueue = new Queue("main-queue", {
  prefix: "siwelbeat-app",
  connection,
});

export default mainQueue;
