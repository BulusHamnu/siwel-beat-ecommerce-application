import type { Response, Request, NextFunction } from "express";
import type { ApiResponse } from "../responseInterface.js";
import type { userProfile } from "../userTypes.js";
import usersServices, {
  type ProfileUpdatesInput,
} from "../../services/users/users.services.js";
import {
  getAllPurchases,
  type PurchasesResult,
} from "../../services/users/userPurchases.service.js";
import AppError from "../../errors/appError.js";
import supabase from "../../services/supabase.js";
import Purchase, {
  type PurchaseInterface,
} from "../../models/purchase.schema.js";

/* Get user profile controller */
export const getProfileController = async (
  req: Request<
    {},
    { status: boolean; message: string; data?: userProfile },
    { email: string },
    {}
  >,
  res: Response<{ status: boolean; message: string; data?: userProfile }>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId: string = req.user!.id;
    const profile: userProfile = await usersServices.getProfile(userId);

    const response: ApiResponse<userProfile> = {
      status: true,
      message: "Profile retrieved successfully.",
      data: profile,
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/* Update user profile controller */
export const updateProfileController = async (
  req: Request<
    {},
    { status: boolean; message: string; data?: userProfile },
    ProfileUpdatesInput,
    {}
  >,
  res: Response<{ status: boolean; message: string; data?: userProfile }>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId: string | undefined = req.user?.id;
    const updates: ProfileUpdatesInput = req.body;

    const profile: userProfile = await usersServices.updateProfile(
      userId,
      updates
    );

    const response: ApiResponse<userProfile> = {
      status: true,
      message: "Profile updated successfully.",
      data: profile,
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/* Post profile picture */
export const updateProfilePictureController = async (
  req: Request<{}, ApiResponse<{ picture: string }>, {}, {}>,
  res: Response<ApiResponse<{ picture: string }>>,
  next: NextFunction
): Promise<void> => {
  let pictureUrl: string = "";

  try {
    const image = req.file;
    const userId = req.user?.id;

    if (!image) throw new AppError("Please provide an image.", 400, true);

    // upload picture
    pictureUrl = await supabase.uploadFile(
      "images",
      image.originalname,
      "pictures/",
      image.buffer
    );

    const picture = await usersServices.updateProfilePicture(
      userId!,
      pictureUrl
    );

    const response: ApiResponse<{ picture: string }> = {
      status: true,
      message: "Profile picture was uploaded successful.",
      data: { picture },
    };

    res.status(200).json(response);
  } catch (error) {
    await supabase.deleteFiles("images", [pictureUrl]);
    next(error);
  }
};

/* Get user's purchases controller */
export const getAllPurchaseController = async (
  req: Request<{}, {}, {}, { type: string; limit: string; page: string }>,
  res: Response<ApiResponse<PurchasesResult>>,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;
    const { page, limit, type } = req.query;

    const purchases = await getAllPurchases(
      user.id,
      type,
      Number(page || 1),
      Number(limit || 10)
    );
    const response: ApiResponse<PurchasesResult> = {
      status: true,
      message: "Purchases retrived successfully",
      data: purchases,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/* Get user's purchase controller */
export const getPurchaseController = async (
  req: Request<{ id: string }, {}, {}, {}>,
  res: Response<ApiResponse<PurchaseInterface>>,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const purchase = await Purchase.findOne({ userId: user.id, _id: id });
    if (!purchase) throw new AppError("Purchase not found", 404, true);

    const response: ApiResponse<PurchaseInterface> = {
      status: true,
      message: "Purchase retrived successfully",
      data: purchase,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
