import type { ObjectId } from "mongoose";
import AppError, { ErrorCodes } from "../errors/appError.js";
import Notification, {
  type notification,
} from "../models/notification.schema.js";
import User, { type UserInterface } from "../models/user.schema.js";

/* Post new notification */
export const postNewNotification = async ({
  userId,
  message,
  type,
  resourceId,
  entityId,
}: {
  userId: string | ObjectId;
  message: string;
  type: string;
  resourceId: string | ObjectId;
  entityId: string | ObjectId | null;
}) => {
  const newNotification: notification = await Notification.create({
    userId,
    message,
    type,
    resourceId,
    entityId,
  });

  return newNotification;
};

/* Get all notifications */
export const getAllNotifications = async (
  userId: string,
  read: boolean,
): Promise<notification[]> => {
  const queries: { read?: Boolean; userId: string } = { userId };
  if (typeof read === "boolean") queries["read"] = read;

  const notifications = Notification.find(queries).sort({ date: -1 });
  return notifications;
};

/* Get a notification */
export const getNotification = async (
  userId: string,
  notificationId: string,
): Promise<notification> => {
  // Users can only retrive their notification
  const notification = await Notification.findOne({
    _id: notificationId,
    userId,
  });

  if (!notification)
    throw new AppError(
      ErrorCodes.NOTIFICATION_NOT_FOUND,
      "Notification not found",
      404,
      true,
      null,
    );
  return notification;
};

/* Update notification as read */
export const updateNotificationStatus = async (
  userId: string,
  notificationId: string,
  read: boolean,
): Promise<notification> => {
  const updatedNotification: notification | null =
    await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { $set: { read } },
      { new: true },
    );

  if (!updatedNotification)
    throw new AppError(
      ErrorCodes.NOTIFICATION_NOT_FOUND,
      "Notification not found",
      404,
      true,
      null,
    );

  return updatedNotification;
};

/* Delete notification */
export const deleteNotification = async (
  userId: string,
  notificationId: string,
): Promise<void> => {
  const notificationDeleted = await Notification.deleteOne({
    _id: notificationId,
    userId,
  });

  if (
    !notificationDeleted.acknowledged ||
    notificationDeleted.deletedCount <= 0
  )
    throw new AppError(
      ErrorCodes.NOTIFICATION_NOT_FOUND,
      "Notification not found",
      404,
      true,
      null,
    );
};

/* Notify admins for event */
export async function notifyAdmins(
  message: string,
  type: string,
  resourceId: string | ObjectId,
  entityId: string | ObjectId | null = null,
) {
  // There is not specify admin, all active admins will be notify
  const admins: UserInterface[] = await User.find({
    role: "admin",
    isActive: true,
  });

  if (admins.length <= 0) return;
  const notificationQueries = admins.map((admin) => {
    Notification.create({
      userId: admin._id,
      message,
      type,
      resourceId,
      entityId,
    });
  });

  await Promise.all(notificationQueries);
}
