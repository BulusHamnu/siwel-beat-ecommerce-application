import { Router } from "express";
import * as cartController from "../../controllers/users/userCart.controller.js";
import { generalApiLimiter } from "../../middlewares/rateLimiter.js";

const router = Router();

/* Cart routes */
router.post("/cart", generalApiLimiter(), cartController.addToCart);
router.patch("/cart", generalApiLimiter(), cartController.removeFromCart);
router.get("/cart", generalApiLimiter(), cartController.getCart);

export default router;
