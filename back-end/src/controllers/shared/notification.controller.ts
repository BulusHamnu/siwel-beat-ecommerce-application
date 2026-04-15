import type { Request, Response, NextFunction } from "express";
import type { ApiResponse } from "../responseInterface.js";
import * as notificationService from "../../services/notification.service.js";
import type { notification } from "../../models/notification.schema.js";
import * as notificationValidator from "../../utils/validators/notification.validator.js";
import validateAndSanitizeBody from "../../utils/validators/validateAndSanitize.js";
import Joi from "joi";

/* Get all notifications */
export const getAllNotifications = async (
  req: Request<{}, {}, {}, { status: string }>,
  res: Response<ApiResponse<notification[]>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { status } = notificationValidator.validateNotificationQuery(
      req.query,
    );

    const notifications = await notificationService.getAllNotifications(
      userId,
      status,
    );

    const response: ApiResponse<notification[]> = {
      status: true,
      message: "Notifications retrieved succesfully.",
      data: notifications,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/* Get a notification */
export const getNotification = async (
  req: Request<{ id: string }, ApiResponse<notification>, {}, {}>,
  res: Response<ApiResponse<notification>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = notificationValidator.validateNotificationParams(req.params);

    const notification = await notificationService.getNotification(user.id, id);

    const response: ApiResponse<notification> = {
      status: true,
      message: "Notification retrieved succesfully.",
      data: notification,
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
    ApiResponse<notification>,
    { read: boolean },
    {}
  >,
  res: Response<ApiResponse<notification>>,
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

    const response: ApiResponse<notification> = {
      status: true,
      message: "Notification status updated succesfully.",
      data: notification,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/* Delete notification  */
export const deleteNotification = async (
  req: Request<{ id: string }, ApiResponse<notification>, {}, {}>,
  res: Response<ApiResponse<notification>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = notificationValidator.validateNotificationParams(req.params);

    await notificationService.deleteNotification(user.id, id);

    const response: ApiResponse<notification> = {
      status: true,
      message: "Notification was deleted succesfully.",
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
