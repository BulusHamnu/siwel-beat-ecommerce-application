import type { Request, Response, NextFunction } from "express";
import type { ApiResponse } from "../responseInterface.js";
import * as notificationService from "../../services/notification.service.js";
import type { NotificationInterface } from "../../models/notification.schema.js";
import * as notificationValidator from "../../utils/validators/notification.validator.js";
import validateAndSanitizeBody from "../../utils/validators/validateAndSanitize.js";
import Joi from "joi";
import {
  toNotificationResponse,
  toNotificationsResponse,
  type NotificationResponse,
} from "../../mappers/notification.mappers.js";

/* Get all notifications */
export const getAllNotifications = async (
  req: Request<{}, ApiResponse<NotificationResponse[]>, {}, { read: string }>,
  res: Response<ApiResponse<NotificationResponse[]>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { read } = notificationValidator.validateNotificationQuery(req.query);

    const notifications = await notificationService.getAllNotifications(
      userId,
      read,
    );

    const notificationsRes = toNotificationsResponse(notifications);
    const response: ApiResponse<NotificationResponse[]> = {
      status: true,
      message: "Notifications retrieved succesfully.",
      data: notificationsRes,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/* Get a notification */
export const getNotification = async (
  req: Request<{ id: string }, ApiResponse<NotificationResponse>, {}, {}>,
  res: Response<ApiResponse<NotificationResponse>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = notificationValidator.validateNotificationParams(req.params);

    const notification = await notificationService.getNotification(user.id, id);

    const notificationRes = toNotificationResponse(notification);
    const response: ApiResponse<NotificationResponse> = {
      status: true,
      message: "Notification retrieved succesfully.",
      data: notificationRes,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/* Update notification status */
function validateNotificationUpdateBody(body: { read: boolean }): {
  read: boolean;
} {
  const bodySchema = Joi.object({
    read: Joi.boolean().required(),
  });

  return validateAndSanitizeBody(body, bodySchema);
}

export const updateNotificationStatus = async (
  req: Request<
    { id: string },
    ApiResponse<NotificationResponse>,
    { read: boolean },
    {}
  >,
  res: Response<ApiResponse<NotificationResponse>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const notificationId = req.params.id;

    const { read } = validateNotificationUpdateBody(req.body);

    const notification = await notificationService.updateNotificationStatus(
      userId,
      notificationId,
      read,
    );

    const notificationRes = toNotificationResponse(notification);
    const response: ApiResponse<NotificationResponse> = {
      status: true,
      message: "Notification status updated succesfully.",
      data: notificationRes,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/* Mark all as read */
export const readAllNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;

    await notificationService.readAllNotifications(userId);

    const response: ApiResponse<void> = {
      status: true,
      message: "All notifications marked as read successfully.",
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/* Delete notification  */
export const deleteNotification = async (
  req: Request<{ id: string }, ApiResponse<NotificationInterface>, {}, {}>,
  res: Response<ApiResponse<NotificationInterface>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = notificationValidator.validateNotificationParams(req.params);

    await notificationService.deleteNotification(user.id, id);

    const response: ApiResponse<NotificationInterface> = {
      status: true,
      message: "Notification was deleted succesfully.",
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
