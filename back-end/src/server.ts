import env from "./configs/env.js";
import connectDb from "./configs/db.js";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import type { Express, Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import logger from "./utils/logger.js";
import errorHandler from "./middlewares/errorHandler.js";
import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/users/users.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import trackRoutes from "./routes/tracks/track.routes.js";
import contactMeRoutes from "./routes/contactme.routes.js";
import newsLetterRoutes from "./routes/newsletter.routes.js";
import checkoutRoutes from "./routes/checkout.routes.js";
import helmet from "helmet";
import { mainWorkerprocessor, workerConfigs } from "./workers/main.worker.js";
import { Worker } from "bullmq";

const app: Express = express();

/* Middlewares */
app.use(
  cors({
    origin: ["http://localhost:3000", "https://siwel-beats.vercel.app"],
    credentials: true,
  }),
);
app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);
app.use(express.json());
app.use(
  morgan("dev", {
    stream: {
      write: (s: string) => {
        logger.http(s.trim());
      },
    },
  }),
);
app.use(cookieParser());

/* Routes */
app.get("/", (req: Request, res: Response, next: NextFunction): void => {
  try {
    res.send("<h1>Hello World</h1>");
  } catch (error: unknown) {
    next(error);
  }
});
app.use("/api/v1/contact-me", contactMeRoutes);
app.use("/api/v1/news-letter", newsLetterRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/tracks", trackRoutes);
app.use("/api/v1/checkouts", checkoutRoutes);
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/admin", adminRoutes);

/* Error handler */
app.use(errorHandler);

/* Initiate Db connection */
await connectDb();

/* Initiate worker */
const mainWorker = new Worker(
  "main-queue",
  mainWorkerprocessor,
  workerConfigs.opts,
);

mainWorker.on("completed", workerConfigs.jobCompletedCallbackFunc);
mainWorker.on("failed", workerConfigs.jobFailedCallbackFunc);
mainWorker.on("ready", workerConfigs.onReadyCallbackFunc);

/* Start server */
app.listen(env.PORT, async (): Promise<void> => {
  logger.info(`Server started on: http://localhost:${env.PORT}`);
});
