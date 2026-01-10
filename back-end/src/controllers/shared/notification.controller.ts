import type { Request, Response, NextFunction } from "express";
import type { ApiResponse } from "../responseInterface.js";
import * as notificationService from "../../services/notification.service.js";
import type { notification } from "../../models/notification.schema.js";
import * as notificationValidator from "../../utils/validators/notification.validator.js";

/* Get all notifications controller */
export const getAllNotifications = async (
  req: Request<{}, {}, {}, { status: string }>,
  res: Response<ApiResponse<notification[]>>,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;
    const { status } = notificationValidator.validateNotificationQuery(
      req.query
    );

    const notifications = await notificationService.getAllNotifications(
      user.id,
      status
    );
    const response: ApiResponse<notification[]> = {
      status: true,
      message: "Notifications retrived succesfully.",
      data: notifications,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/* Get a notification controller */
export const getNotification = async (
  req: Request<{ id: string }, ApiResponse<notification>, {}, {}>,
  res: Response<ApiResponse<notification>>,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = notificationValidator.validateNotificationParams(req.params);

    const notification = await notificationService.getNotification(user.id, id);

    const response: ApiResponse<notification> = {
      status: true,
      message: "Notification retrived succesfully.",
      data: notification,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/* Update notification as read controller*/
export const markNoticationAsRead = async (
  req: Request<{ id: string }, ApiResponse<notification>, {}, {}>,
  res: Response<ApiResponse<notification>>,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = notificationValidator.validateNotificationParams(req.params);

    const updatedNotification =
      await notificationService.updateNotificationStatus(user.id, id, true);

    const response: ApiResponse<notification> = {
      status: true,
      message: "Notification was updated succesfully.",
      data: updatedNotification,
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/* Update notification as unread controller*/
export const markNoticationAsUnread = async (
  req: Request<{ id: string }, ApiResponse<notification>, {}, {}>,
  res: Response<ApiResponse<notification>>,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = notificationValidator.validateNotificationParams(req.params);

    const updatedNotification =
      await notificationService.updateNotificationStatus(user.id, id, false);

    const response: ApiResponse<notification> = {
      status: true,
      message: "Notification was updated succesfully.",
      data: updatedNotification,
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
  next: NextFunction
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
