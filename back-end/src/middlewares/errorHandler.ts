import type {
  Response,
  Request,
  NextFunction,
  ErrorRequestHandler,
} from "express";
import AppError from "../errors/appError.js";
import logger from "../utils/logger.js";

// error middleware
const errorHandler: ErrorRequestHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error("An error occur: ", err);
  if (err instanceof AppError) {
    res.status(err.status).json({
      status: false,
      message: err.isOperational
        ? err.message
        : "An unexepected error occured, please try again later",
    });
  } else {
    res.status(500).json({
      status: false,
      message: "An unexepected error occured, please try again later.",
    });
  }
};

export default errorHandler;
