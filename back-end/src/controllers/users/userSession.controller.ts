import type { Response, Request, NextFunction } from "express";
import { type ApiResponse } from "../responseInterface.js";
import { type SessionInterface } from "../../models/session.schema.js";
import * as sessionService from "../../services/users/userSession.service.js";

/* Get sessions handler */
export const getSessions = async (
  req: Request<{}, ApiResponse<SessionInterface[]>, {}, {}>,
  res: Response<ApiResponse<SessionInterface[]>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const sessions = await sessionService.getUserSessions(userId);

    const response: ApiResponse<SessionInterface[]> = {
      status: true,
      message: "Sessions retrived successfully.",
      data: sessions,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/* Get sessions handler */
export const removeSession = async (
  req: Request<{ id: string }, ApiResponse<null>, {}, {}>,
  res: Response<ApiResponse<null>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const sessionId = req.params.id;

    await sessionService.removeUserSession(userId, sessionId);

    const response: ApiResponse<null> = {
      status: true,
      message: "Session removed successfully.",
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
