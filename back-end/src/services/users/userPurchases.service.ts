import Purchase, {
  type PurchaseInterface,
} from "../../models/purchase.schema.js";
import { type Pagination } from "../../controllers/responseInterface.js";
import type { FilterQuery } from "mongoose";
import AppError, { ErrorCodes } from "../../errors/appError.js";

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
  const purchasesQuery = Purchase.find(queries)
    .skip(skip)
    .limit(limit + 1)
    .sort({ createdAt: -1 })
    .populate(
      "trackId",
      "genre tags bpm status key type description title _id",
    );

  const [purchaseCount, purchasesWithExtra] = await Promise.all([
    countsQuery,
    purchasesQuery,
  ]);

  return { purchaseCount, purchasesWithExtra };
}

export interface PurchasesResult {
  purchases: PurchaseInterface[];
  pagination: Pagination;
}

export const getUserPurchases = async (
  userId: string,
  type: string,
  page: number,
  limit: number,
): Promise<PurchasesResult> => {
  const skip = (page - 1) * limit;

  const queries = buildQueries(userId, type);
  const { purchaseCount, purchasesWithExtra } = await getPurchasesAndCounts(
    queries,
    skip,
    limit,
  );

  // For easy navigation through purchases
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
): Promise<PurchaseInterface> => {
  const purchase = await Purchase.findOne({
    _id: purchaseId,
    userId,
  })
    .populate("trackId", "genre tags bpm status key type description title _id")
    .lean<PurchaseInterface>();

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
