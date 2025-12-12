import type { Response, Request, NextFunction } from "express";
import type { ApiResponse } from "./responseInterface.js";
import type { userProfile } from "./userTypes.js";
import {
  getProfile,
  updateProfile,
  updateProfilePicture,
  addFavouriteTrack,
  addToCart,
  removeFromCart,
  getUserCart,
  getAllPurchases,
  type purchasesResult,
} from "../services/users.services.js";
import type { updates } from "../services/users.services.js";
import AppError from "../errors/appError.js";
import supabase from "../services/supabase.js";
import Favourite, {
  type FavouriteInterface,
} from "../models/favourite.schema.js";
import type { cartItem } from "../models/profile.schema.js";
import type { purchase } from "../models/purchase.schema.js";
import Purchase from "../models/purchase.schema.js";

// GET USER PROFILE PROFILE CONTROLLER
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
    const userId: string | undefined = req.user?.id;
    const profile: userProfile = await getProfile(userId || "");

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

// UPDATE USER PROFILE CONTROLLER
export const updateProfileController = async (
  req: Request<
    {},
    { status: boolean; message: string; data?: userProfile },
    updates,
    {}
  >,
  res: Response<{ status: boolean; message: string; data?: userProfile }>,
  next: NextFunction
): Promise<void> => {
  try {
    const userId: string | undefined = req.user?.id;
    const updates: updates = req.body;

    const profile: userProfile = await updateProfile(userId, updates);

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

// POST PROFILE PICTURE CONTROLLER
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

    const picture = await updateProfilePicture(userId!, pictureUrl);

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

// ADD USER'S FAVOURITES
export const addUsersFavourites = async (
  req: Request<{}, ApiResponse<void>, { trackId: string }, {}>,
  res: Response<ApiResponse<void>>,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;
    const { trackId } = req.body;

    await addFavouriteTrack(user.id, trackId);

    const response: ApiResponse<void> = {
      status: true,
      message: "Track was added to favourites list successfully.",
    };
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

// GET USER'S FAVOURITES
export const getUsersFavourites = async (
  req: Request<{}, ApiResponse<FavouriteInterface[]>, {}, {}>,
  res: Response<ApiResponse<FavouriteInterface[]>>,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;

    const favourites = await Favourite.find({ userId: user.id }).populate(
      "trackId",
      "relatedTrack genre tags bpm status key type description price title _id"
    );

    const response: ApiResponse<FavouriteInterface[]> = {
      status: true,
      message: "Favourite tracks retrived successfully.",
      data: favourites,
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// REMOVE FROM FAVOURITE LIST
export const removeFromUsersFavourites = async (
  req: Request<{}, ApiResponse<void>, { trackId: string }, {}>,
  res: Response<ApiResponse<void>>,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;
    const { trackId } = req.body;

    await Favourite.findOneAndDelete({ trackId, userId: user.id });

    const response: ApiResponse<void> = {
      status: true,
      message: "Track was removed from favourites list.",
    };
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

// ADD TO USER'S CART
export const addToCartController = async (
  req: Request<{}, ApiResponse<void>, { trackId: string; license: string }, {}>,
  res: Response<ApiResponse<void>>,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;
    const { trackId, license } = req.body;

    await addToCart(trackId, license, user.id);

    const response: ApiResponse<void> = {
      status: true,
      message: "Product added to cart sucessfully.",
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// REMOVE PRODUCT FROM USER'S CART
export const removeItemFromCartController = async (
  req: Request<{}, ApiResponse<void>, { trackId: string; license: string }, {}>,
  res: Response<ApiResponse<void>>,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;
    const { trackId, license } = req.body;

    await removeFromCart(trackId, license, user.id);

    const response: ApiResponse<void> = {
      status: true,
      message: "Product was removed from cart sucessfully.",
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// GET CART CONTROLLER
export const getCartController = async (
  req: Request<{}, ApiResponse<cartItem[]>, {}, {}>,
  res: Response<ApiResponse<cartItem[]>>,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;

    const cart = await getUserCart(user.id);
    const response: ApiResponse<cartItem[]> = {
      status: true,
      message: "Cart retrived successfully.",
      data: cart,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/* Get user's purchases controller */
export const getAllPurchaseController = async (
  req: Request<{}, {}, {}, { type: string; limit: string; page: string }>,
  res: Response<ApiResponse<purchasesResult>>,
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
    const response: ApiResponse<purchasesResult> = {
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
  res: Response<ApiResponse<purchase>>,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const purchase = await Purchase.findOne({ userId: user.id, _id: id });
    if (!purchase) throw new AppError("Purchase not found", 404, true);

    const response: ApiResponse<purchase> = {
      status: true,
      message: "Purchase retrived successfully",
      data: purchase,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
