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
import publicApis from "./routes/public.apis.routes.js";
import newsLetterRoutes from "./routes/newsletter.routes.js";
import checkoutRoutes from "./routes/checkout.routes.js";
import helmet from "helmet";

// Initiate server
const app: Express = express();

// Middlewares
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(express.json());
app.use(cors({ origin: "*", credentials: true }));
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

// Routes
app.get("/", (req: Request, res: Response, next: NextFunction): void => {
  try {
    res.send("<h1>Hello World</h1>");
  } catch (error: unknown) {
    next(error);
  }
});
app.use("/api/v1/contact-me", publicApis);
app.use("/api/v1/news-letter", newsLetterRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/tracks", trackRoutes);
app.use("/api/v1/checkout", checkoutRoutes);
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/admin", adminRoutes);

// error handler
app.use(errorHandler);

app.listen(env.PORT, async (): Promise<void> => {
  await connectDb();
  logger.info(`Server started on: http://localhost:${env.PORT}`);
});
