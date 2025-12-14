import User, { type UserDocument } from "../models/user.schema.js";
import Profile, {
  type cartItem,
  type ProfileDocument,
} from "../models/profile.schema.js";
import type { userProfile } from "../controllers/userTypes.js";
import AppError from "../errors/appError.js";
import supabase from "./supabase.js";
import Favourite from "../models/favourite.schema.js";
import Track, { type TrackInterface } from "../models/track.schema.js";
import mongoose from "mongoose";
import type { purchase } from "../models/purchase.schema.js";
import Purchase from "../models/purchase.schema.js";
import type { Pagination } from "../controllers/responseInterface.js";

// GET USER PROFILE SERVICE
export const getProfile = async (id: string): Promise<userProfile> => {
  const user: UserDocument | null = await User.findOne({ _id: id });
  if (!user) throw new AppError("User not found.", 404, true);

  const profile: ProfileDocument | null = await Profile.findOne({
    userId: user._id,
  });
  const profileObj = profile?.toObject();
  delete profileObj.cart;

  return {
    username: user.username,
    isVerified: user.isVerified,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    ...profileObj,
  };
};

// UPDATE USER PROFILE SERVICE
export interface updates {
  username?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  bio?: string;
  profilePic?: string;
  email?: string;
  notification?: {
    emailNotification: {
      commentAndLikes: boolean;
    };
  };
}

export interface ProfileUpdates extends updates {
  "notification.emailNotification.commentAndLikes"?: boolean | undefined;
}

export const updateProfile = async (
  id: string | undefined,
  updates: ProfileUpdates
): Promise<userProfile> => {
  const allowFields = [
    "username",
    "firstName",
    "lastName",
    "gender",
    "bio",
    "profilePic",
    "notification",
  ];

  for (const key of Object.keys(updates) as (keyof updates)[]) {
    if (!allowFields.includes(key)) delete updates[key];

    // construt mongo dot notation object update
    if (key === "notification") {
      updates["notification.emailNotification.commentAndLikes"] =
        updates.notification?.emailNotification.commentAndLikes;

      delete updates["notification"];
    }
  }

  const user: UserDocument | null = await User.findOne({ _id: id });
  if (!user) throw new AppError("User does not exist.", 404, true);

  const profile: ProfileDocument | null = await Profile.findOneAndUpdate(
    { userId: user._id },
    { $set: updates },
    { new: true }
  );

  if (updates["username"]) {
    user.username = updates["username"];
    await user.save();
  }

  return {
    username: user.username,
    isVerified: user.isVerified,
    email: user.email,
    role: user.role,
    ...profile?.toObject(),
  };
};

// UPDATE PROFILE PROFILE
export const updateProfilePicture = async (
  userId: string,
  pictureUrl: string
): Promise<string> => {
  const profile_x: ProfileDocument | null = await Profile.findOne({ userId });
  const oldPicturePath = profile_x?.picture.split("images/")[1] || "";

  const publicUrl = await supabase.getPublicUrl("images", pictureUrl); // get public url
  const profile: ProfileDocument | null = await Profile.findOneAndUpdate(
    { userId },
    { $set: { picture: publicUrl } },
    { new: true }
  );

  if (!profile)
    throw new AppError("Unable to update profile picture.", 500, true);

  // delete old picture
  if (oldPicturePath) await supabase.deleteFiles("images", [oldPicturePath]);
  return publicUrl;
};

// ADD FAVOURITES SERVICE
export const addFavouriteTrack = async (
  userId: string,
  trackId: string
): Promise<void> => {
  const fav = await Favourite.findOne({ trackId, userId });
  console.log(fav);
  if (fav)
    throw new AppError("Track is already in the favourites list.", 400, true);

  await Favourite.create({ userId, trackId });
};

// ADD TRACK TO CART SERVICE
export const addToCart = async (
  trackId: string,
  license: string,
  userId: string
): Promise<void> => {
  const track: TrackInterface | null = await Track.findOne({ _id: trackId });

  if (!track) throw new AppError("Track not found", 404, true);

  const userProfile: ProfileDocument | null = await Profile.findOne({ userId });

  // check if product is already in cart
  const productExist = userProfile?.cart.find(
    (track) =>
      String(track.productId) === String(trackId) && license === track.license
  );

  if (productExist)
    throw new AppError("Product already exist in cart.", 400, true);

  const product: cartItem = {
    name: track.title,
    productId: track._id as any,
    license,
    price: license === "basic" ? track.basicPrice : track.premiumPrice,
    type: track.type,
  };

  userProfile?.cart.push(product);
  await userProfile?.save();
};

// ADD FROM CART SERVICE
export const removeFromCart = async (
  trackId: string,
  license: string,
  userId: string
): Promise<void> => {
  const track: TrackInterface | null = await Track.findOne({ _id: trackId });

  if (!track) throw new AppError("Track not found", 404, true);

  const id = new mongoose.Types.ObjectId(trackId); // change track id to object id
  await Profile.findOneAndUpdate(
    { userId },
    { $pull: { cart: { productId: id, license } } },
    { new: true }
  );
};

/* Get users cart */
async function verifyProductsStatus(cart: cartItem[]): Promise<cartItem[]> {
  const itemPromiseRequests: any = cart.map(async (product: any) => {
    const track = await Track.findOne({ _id: product.productId });

    if (!track) {
      product.status = "deleted";
    } else if (track.status === "in-active") {
      product.status = "in-active";
    } else if (
      (product.license === "basic" && track.basicPrice !== product.price) ||
      (product.license === "premium" && track.premiumPrice !== product.price)
    ) {
      product.status = "price_changed";
      product.newPrice =
        product.license === "basic" ? track.basicPrice : track.premiumPrice;
    } else {
      product.status = "active";
    }

    return product;
  });

  const refinedCart: cartItem[] = await Promise.all(itemPromiseRequests);
  return refinedCart;
}

export const getUserCart = async (userId: string): Promise<cartItem[]> => {
  const userProfile: ProfileDocument | null = await Profile.findOne({ userId });
  const profileObj = userProfile!.toObject();

  // User should know if product changed the last time
  const cart = await verifyProductsStatus(profileObj.cart);
  return cart;
};

/* Get purchases */
interface queries {
  type?: string;
  userId: string;
}
function constructQueries(userId: string, type: string): queries {
  // User only get their purchases
  const queries: queries = {
    userId,
  };
  if (type) queries["type"] = type;

  return queries;
}

// Get purchases and purchases document counts
async function getPurchasesAndCounts(
  queries: queries,
  skip: number,
  limit: number
) {
  const countsQuery = Purchase.find(queries).countDocuments();
  const purchasesQuery = Purchase.find(queries)
    .skip(skip)
    .limit(limit + 1);

  const [purchaseCount, purchasesWithOverhead] = await Promise.all([
    countsQuery,
    purchasesQuery,
  ]);

  return { purchaseCount, purchasesWithOverhead };
}

export interface purchasesResult {
  purchases: purchase[];
  pagination: Pagination;
}

export const getAllPurchases = async (
  userId: string,
  type: string,
  page: number,
  limit: number
): Promise<purchasesResult> => {
  const skip = (page - 1) * limit;

  const queries = constructQueries(userId, type);
  const { purchaseCount, purchasesWithOverhead } = await getPurchasesAndCounts(
    queries,
    skip,
    limit
  );

  // For easy navigation through purchases
  const hasNext = purchasesWithOverhead.length > limit;
  const totalPage = Math.ceil(purchaseCount / limit);
  const purchases = purchasesWithOverhead.slice(0, limit);

  return {
    purchases,
    pagination: {
      page,
      limit,
      hasNext,
      totalPage,
    },
  };
};
