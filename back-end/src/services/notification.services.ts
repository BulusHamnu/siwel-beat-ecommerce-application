import AppError from "../errors/appError.js";
import Notification, {
  type notification,
} from "../models/notification.schema.js";
import User, { type UserDocument } from "../models/user.schema.js";

/* Post new notification */
export const postNewNotification = async (
  userId: string,
  message: string,
  type: string,
  entityId: string | null
) => {
  const newNotification: notification = await Notification.create({
    userId,
    message,
    type,
    entityId,
  });

  return newNotification;
};

/* Get all notifications */
function constructQueries(
  userId: string,
  read: string = ""
): { status?: string; userId: string } {
  const queries: { read?: Boolean; userId: string } = { userId };
  if (read) queries["read"] = read === "true" ? true : false;
  return queries;
}

export const getAllNotifications = async (
  userId: string,
  read: string
): Promise<notification[]> => {
  const queries = constructQueries(userId, read);
  const notifications = Notification.find(queries);
  return notifications;
};

/* Get a notification */
export const getNotification = async (
  userId: string,
  notificationId: string
): Promise<notification> => {
  // Users can only retrive their notification
  const notification = await Notification.findOne({
    _id: notificationId,
    userId,
  });
  if (!notification) throw new AppError("Notification not found", 404, true);
  return notification;
};

/* Update notification as read */
export const updateNotificationAsRead = async (
  userId: string,
  notificationId: string,
  read: Boolean
): Promise<notification> => {
  const updatedNotification: notification | null =
    await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { $set: { read } },
      { new: true }
    );

  if (!updatedNotification)
    throw new AppError("Notification not found", 404, true);

  return updatedNotification;
};

/* Delete notification */
export const deleteNotification = async (
  userId: string,
  notificationId: string
): Promise<void> => {
  // Allowed only logged user to delete their notification
  await Notification.findOneAndDelete({
    _id: notificationId,
    userId,
  });
};

/* Notify admins for event */
export async function notifyAdmins(
  message: string,
  type: string,
  entityId: string | null = null
) {
  // There is not specify admin, all active admins will be notify
  const admins: UserDocument[] = await User.find({
    role: "admin",
    isActive: true,
  });

  if (admins.length <= 0) return;
  const notificationQueries = admins.map((admin) => {
    return postNewNotification(admin._id as string, message, type, entityId);
  });

  await Promise.all(notificationQueries);
}
