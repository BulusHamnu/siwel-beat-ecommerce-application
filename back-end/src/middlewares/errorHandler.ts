import type {
  Response,
  Request,
  NextFunction,
  ErrorRequestHandler,
} from "express";
import AppError, { type customAppError } from "../errors/appError.js";
import logger from "../utils/logger.js";
import type { ApiResponse } from "../controllers/responseInterface.js";

// error middleware
const errorHandler: ErrorRequestHandler = (
  err: customAppError,
  req: Request<{}, ApiResponse<void | customAppError>, {}, {}>,
  res: Response<ApiResponse<void | customAppError>>,
  next: NextFunction,
) => {
  logger.error("An error occur: ", err);
  if (err instanceof AppError) {
    return res.status(err.status).json({
      status: false,
      message: err.isOperational
        ? err.message
        : "An unexepected error occured, please try again later",
      error: {
        code: err.code,
        details: err.details,
      },
    });
  } else {
    if (err.stack?.includes("File too large")) {
      return res.status(400).json({
        status: false,
        message: "File is too large!",
        error: {
          code: "FILE_TOO_LARGE",
          details: null,
        },
      });
    }
    //
    res.status(500).json({
      status: false,
      message: "An unexepected error occured, please try again later.",
      error: {
        code: "UNEXEPECTED_ERROR",
        details: null,
      },
    });
  }
};

export default errorHandler;
