import { Router } from "express";
import * as cartController from "../../controllers/users/userCart.controller.js";

const router = Router();

/* Cart routes */
router.post("/cart", cartController.addToCart);
router.patch("/cart", cartController.removeFromCart);
router.get("/cart", cartController.getCart);

export default router;
