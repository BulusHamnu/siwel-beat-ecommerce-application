import { Router } from "express";
import withAuth from "../../middlewares/withAuth.js";
import allowRole from "../../middlewares/allowRole.js";
import * as cartController from "../../controllers/users/userCart.controller.js";

const router = Router();

/* Cart routes */
router.post(
  "/cart",
  withAuth,
  allowRole("user"),
  cartController.addToCart
);
router.patch(
  "/cart",
  withAuth,
  allowRole("user"),
  cartController.removeFromCart
);

router.get(
  "/cart",
  withAuth,
  allowRole("user"),
  cartController.getCart
);

export default router;
