import Purchase, {
  type PurchaseInterface,
} from "../../models/purchase.schema.js";
import { type Pagination } from "../../controllers/responseInterface.js";
import type { FilterQuery } from "mongoose";

/* Get purchases */
interface PurchaseQueries {
  type?: string;
  userId: string;
}
function buildQueries(
  userId: string,
  type?: string
): FilterQuery<PurchaseQueries> {
  // User only get their purchases
  const queries: FilterQuery<PurchaseQueries> = {
    userId,
  };
  if (type) queries["type"] = type;

  return queries;
}

// Get purchases and purchases document counts
async function getPurchasesAndCounts(
  queries: FilterQuery<PurchaseQueries>,
  skip: number,
  limit: number
) {
  const countsQuery = Purchase.find(queries).countDocuments();
  const purchasesQuery = Purchase.find(queries)
    .skip(skip)
    .limit(limit + 1);

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

export const getAllPurchases = async (
  userId: string,
  type: string,
  page: number,
  limit: number
): Promise<PurchasesResult> => {
  const skip = (page - 1) * limit;

  const queries = buildQueries(userId, type);
  const { purchaseCount, purchasesWithExtra } = await getPurchasesAndCounts(
    queries,
    skip,
    limit
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
