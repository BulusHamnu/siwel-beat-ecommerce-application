import express, { Router } from "express";
import withAuth from "../../middlewares/withAuth.js";
import allowRole from "../../middlewares/allowRole.js";
import { uploadPicture } from "../../middlewares/upload.js";
import * as orderController from "../../controllers/shared/orders.shared.controller.js";
import * as profileController from "../../controllers/profile.controller.js";
import * as purchaseController from "../../controllers/users/userPurchases.controller.js";
import favoritesRoutes from "./userFavourites.routes.js";
import cartRoutes from "./userCart.routes.js";
import notificationRoutes from "./userNotification.routes.js";

const router = Router();

router.use(withAuth);
router.use(allowRole("user"));

/* Profile */
router.get("/me", profileController.getProfile);
router.patch("/me", profileController.updateProfile);
router.patch("/me/picture", uploadPicture, profileController.updateUserAvatar);

router.use("/me", notificationRoutes);
router.use("/me", favoritesRoutes);

/* Orders routes */
router.get("/me/orders", orderController.getAllOrders);
router.get("/me/orders/:id", orderController.getOrder);

/* Purchases routes */
router.get("/me/purchases", purchaseController.getAllPurchase);
router.get("/me/purchases/:id", purchaseController.getPurchase);

/* Cart routes */
router.use("/me", cartRoutes);

export default router;
