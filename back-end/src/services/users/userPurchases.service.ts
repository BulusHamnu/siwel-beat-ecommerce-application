import Purchase, {
  type PurchaseInterface,
} from "../../models/purchase.schema.js";
import { type Pagination } from "../../controllers/responseInterface.js";
import type { FilterQuery, ObjectId, Query } from "mongoose";
import AppError, { ErrorCodes } from "../../errors/appError.js";

export interface PopulatedPurchase extends Omit<PurchaseInterface, "trackId"> {
  trackId: {
    _id: ObjectId;
    coverImageUrl: string;
    title: string;
    description: string;
    key: string;
    type: string;
    status: string;
    bpm: number;
    tags: string[];
    genre: string;
  };
}

/* Get purchases */
interface PurchaseQueries {
  type?: string;
  userId: string;
}

function buildQueries(
  userId: string,
  type?: string,
): FilterQuery<PurchaseQueries> {
  // User only get their purchases
  const queries: FilterQuery<PurchaseQueries> = {
    userId,
  };

  if (type) queries["type"] = type;

  return queries;
}

async function getPurchasesAndCounts(
  queries: FilterQuery<PurchaseQueries>,
  skip: number,
  limit: number,
) {
  const countsQuery = Purchase.find(queries).countDocuments();
  const purchasesQuery: any = Purchase.find(queries)
    .skip(skip)
    .limit(limit + 1)
    .sort({ createdAt: -1 })
    .populate({
      path: "trackId",
      select:
        "_id coverImageUrl title description key type status bpm tags genre",
    });

  const [purchaseCount, purchasesWithExtra]: [number, PopulatedPurchase[]] =
    await Promise.all([countsQuery, purchasesQuery]);

  return { purchaseCount, purchasesWithExtra };
}

export const getUserPurchases = async (
  userId: string,
  type: string,
  page: number = 1,
  limit: number = 10,
): Promise<{ purchases: PopulatedPurchase[]; pagination: Pagination }> => {
  const skip = (page - 1) * limit;

  const queries = buildQueries(userId, type);
  const { purchaseCount, purchasesWithExtra } = await getPurchasesAndCounts(
    queries,
    skip,
    limit,
  );

  const hasNext = purchasesWithExtra.length > limit;
  const totalPage = Math.ceil(purchaseCount / limit);
  const purchases = purchasesWithExtra.slice(0, limit);

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

/* Get a purchase */
export const getPurchase = async (
  userId: string,
  purchaseId: string,
): Promise<PopulatedPurchase> => {
  const purchase = await Purchase.findOne({
    _id: purchaseId,
    userId,
  })
    .populate({
      path: "trackId",
      select:
        "_id coverImageUrl title description key type status bpm tags genre",
    })
    .lean<PopulatedPurchase>();

  if (!purchase)
    throw new AppError(
      ErrorCodes.PURCHASE_NOT_FOUND,
      "Purchase not found",
      404,
      true,
      null,
    );

  return purchase;
};

/* Check for user purchase */
export async function checkForPurchase(
  role: string,
  userId: string,
  licenseType: string,
  trackId: string,
): Promise<void> {
  if (role === "admin") return;
  let purchasedTrack: PurchaseInterface | null = await Purchase.findOne({
    trackId,
    userId,
    type: licenseType,
  });

  if (!purchasedTrack)
    throw new AppError(
      ErrorCodes.PURCHASE_NOT_FOUND,
      "Unable to download license, no purchase found.",
      404,
      true,
      null,
    );
}
