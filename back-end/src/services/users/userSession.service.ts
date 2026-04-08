import AppError, { ErrorCodes } from "../../errors/appError.js";
import Session from "../../models/session.schema.js";
import mongoose from "mongoose";

/* Get user session function */
export async function getUserSessions(userId: string) {
  return await Session.find({ userId });
}

/* Delete a session */
export async function removeUserSession(userId: string, id: string) {
  const sessionId = new mongoose.Types.ObjectId(id);

  const deleted = await Session.deleteOne({ _id: sessionId, userId });
  console.log(deleted);
  if (!deleted.acknowledged || deleted.deletedCount <= 0) {
    throw new AppError(
      ErrorCodes.SESSION_NOT_FOUND,
      "Session not found.",
      404,
      true,
      null,
    );
  }
}
