import AppError from "../errors/appError.js";
import Profile, {
  type cartItem,
  type ProfileDocument,
} from "../models/profile.schema.js";
import Track from "../models/track.schema.js";

export interface checkoutSummary {
  total: number;
  items: cartItem[];
}
/* Get checkout summary */
async function verifyItemsStatus(cart: cartItem[]): Promise<cartItem[]> {
  const itemPromiseRequests: any = cart.map(async (product: any) => {
    const track = await Track.findOne({ _id: product.productId });

    if (!track || track.status === "in-active") {
      throw new AppError(
        "Some items in your cart are invalid, please confirm and update cart.",
        400,
        true
      );
    } else if (
      (product.license === "basic" && track.basicPrice !== product.price) ||
      (product.license === "premium" && track.premiumPrice !== product.price)
    ) {
      throw new AppError(
        `Price for ${product.name} has changed. Update your cart.`,
        400,
        true
      );
    }

    return product;
  });

  const refinedCart: cartItem[] = await Promise.all(itemPromiseRequests);
  return refinedCart;
}

export const getCheckoutSummary = async (
  userId: string
): Promise<checkoutSummary> => {
  const userProfile: ProfileDocument | null = await Profile.findOne({ userId });
  const profileObj = userProfile?.toObject();

  const cart: cartItem[] = profileObj.cart;
  // Items have to be valid for checkout
  const items = await verifyItemsStatus(cart);

  let totalAmount: number = 0;
  for (const product of cart as any) {
    totalAmount += Number(product.price);
  }

  return { items, total: totalAmount };
};
