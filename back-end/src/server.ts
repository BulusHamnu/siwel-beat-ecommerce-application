import env from "./configs/env.js";
import connectDb from "./configs/db.js";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import type { Express, Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import logger from "./utils/logger.js";
import AppError from "./errors/appError.js";
// import type { customAppError } from "./errors/appError.js";
import errorHandler from "./middlewares/errorHandler.js";
import authRoutes from "./routes/auths/authRoutes.js";

// initiate server
const app: Express = express();
app.use(express.json());
app.use(cors({ origin: "*" }));
app.use(
  morgan("dev", {
    stream: {
      write: (s: string) => {
        logger.http(s.trim());
      },
    },
  })
);
app.use(cookieParser());

// routes
app.get(
  "/",
  (
    req: Request<{}, {}, {}, {}>,
    res: Response<{}>,
    next: NextFunction
  ): void => {
    try {
      res.send("<h1>Hello World</h1>");
    } catch (error: unknown) {
      next(error);
    }
  }
);
app.use("/api", authRoutes);

// error handler
app.use(errorHandler);

app.listen(env.PORT, async (): Promise<void> => {
  await connectDb();
  logger.info(`Server started on: http://localhost:${env.PORT}`);
});
