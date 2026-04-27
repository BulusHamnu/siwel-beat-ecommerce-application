import type { NotificationInterface } from "../models/notification.schema.js";

export interface NotificationResponse {
  id: string;
  type: string;
  message: string;
  read: boolean;
  resourceId: string;
  entityId: string;
  date: Date;
}

/* Notification response mapper */
export function toNotificationResponse(
  notification: NotificationInterface,
): NotificationResponse {
  return {
    id: String(notification._id),
    type: notification.type,
    message: notification.message,
    read: notification.read,
    resourceId: String(notification.resourceId),
    entityId: String(notification.entityId),
    date: notification.date,
  };
}

export function toNotificationsResponse(
  notifications: NotificationInterface[],
): NotificationResponse[] {
  return notifications.map((notification) => {
    return toNotificationResponse(notification);
  });
}
