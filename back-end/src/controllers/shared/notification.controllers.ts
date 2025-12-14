import type { Request, Response, NextFunction } from "express";
import type { ApiResponse } from "../responseInterface.js";
import {
  deleteNotification,
  getAllNotifications,
  getNotification,
  updateNotificationAsRead,
} from "../../services/notification.services.js";
import type { notification } from "../../models/notification.schema.js";

/* Get all notifications controller */
export const getAllNotificationsController = async (
  req: Request<{}, {}, {}, { read: string }>,
  res: Response<ApiResponse<notification[]>>,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;
    const { read } = req.query;

    const notifications = await getAllNotifications(user.id, read);
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
export const getNotificationController = async (
  req: Request<{ id: string }, ApiResponse<notification>, {}, {}>,
  res: Response<ApiResponse<notification>>,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const notification = await getNotification(user.id, id);
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
export const updateNoticationAsReadController = async (
  req: Request<
    { id: string },
    ApiResponse<notification>,
    { read: Boolean },
    {}
  >,
  res: Response<ApiResponse<notification>>,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const { read } = req.body;

    const updatedNotification = await updateNotificationAsRead(
      user.id,
      id,
      read
    );
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
export const deleteNotificationController = async (
  req: Request<{ id: string }, ApiResponse<notification>, {}, {}>,
  res: Response<ApiResponse<notification>>,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;

    await deleteNotification(user.id, id);
    const response: ApiResponse<notification> = {
      status: true,
      message: "Notification was deleted succesfully.",
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
