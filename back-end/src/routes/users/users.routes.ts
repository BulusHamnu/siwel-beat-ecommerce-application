import { Router } from "express";
import requiredAuth from "../../middlewares/requiredAuth.js";
import allowRole from "../../middlewares/allowRole.js";
import { uploadPicture } from "../../middlewares/upload.js";
import * as orderController from "../../controllers/shared/orders.shared.controller.js";
import * as profileController from "../../controllers/profile.controller.js";
import * as purchaseController from "../../controllers/users/userPurchases.controller.js";
import favoritesRoutes from "./userFavourites.routes.js";
import cartRoutes from "./userCart.routes.js";
import notificationRoutes from "./userNotification.routes.js";
import rateLimiter, {
  generalApiLimiter,
  creationApiLimiter,
} from "../../middlewares/rateLimiter.js";
import * as sessionController from "../../controllers/users/userSession.controller.js";

const router = Router();

router.use(requiredAuth);
router.use(allowRole("user"));

/* Profile */
router.get("/me", generalApiLimiter(), profileController.getProfile);
router.patch("/me", creationApiLimiter(), profileController.updateProfile);
router.patch(
  "/me/avatar",
  rateLimiter(20, 10 * 60 * 1000),
  uploadPicture,
  profileController.updateUserAvatar,
);

/* Session routes */
router.get("/me/sessions", generalApiLimiter(), sessionController.getSessions);
router.delete(
  "/me/sessions/:id",
  generalApiLimiter(),
  sessionController.removeSession,
);

/* Notification Route */
router.use("/me", notificationRoutes);
router.use("/me", favoritesRoutes);

/* Orders routes */
router.get("/me/orders", generalApiLimiter(), orderController.getAllOrders);
router.get("/me/orders/:id", generalApiLimiter(), orderController.getOrder);

/* Purchases routes */
router.get(
  "/me/purchases",
  generalApiLimiter(),
  purchaseController.getAllPurchase,
);
router.get(
  "/me/purchases/:id",
  generalApiLimiter(),
  purchaseController.getPurchase,
);

/* Cart routes */
router.use("/me", cartRoutes);

export default router;
