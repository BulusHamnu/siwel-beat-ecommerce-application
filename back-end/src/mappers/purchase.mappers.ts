import type { PopulatedPurchase } from "../services/users/userPurchases.service.js";

export interface PurchaseResponse {
  track: {
    id: string;
    coverImageUrl: string;
    title: string;
    description: string;
    type: string;
    key: string;
    status: string;
    bpm: number;
    tags: string[];
    genre: string;
  };
  type: string;
  orderId: string;
  amount: number;
}

/* Purchase response mapper */
export function mapPurchase(purchase: PopulatedPurchase): PurchaseResponse {
  const track = purchase.trackId;
  return {
    track: {
      id: String(track._id),
      coverImageUrl: track.coverImageUrl,
      title: track.title,
      description: track.description,
      type: track.type,
      key: track.key,
      status: track.status,
      bpm: track.bpm,
      tags: track.tags,
      genre: track.genre,
    },
    type: purchase.type,
    orderId: String(purchase.orderId),
    amount: purchase.amount,
  };
}

export function mapPurchases(purchases: PopulatedPurchase[]) {
  console.log(purchases);
  return purchases.map((purchase) => {
    return mapPurchase(purchase);
  });
}
