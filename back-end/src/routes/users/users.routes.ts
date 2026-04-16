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

/* Profile */
router.get(
  "/me",
  generalApiLimiter(),
  requiredAuth,
  allowRole("user"),
  profileController.getProfile,
);
router.patch(
  "/me",
  creationApiLimiter(),
  requiredAuth,
  allowRole("user"),
  profileController.updateProfile,
);

router.patch(
  "/me/avatar",
  rateLimiter(20, 10 * 60 * 1000),
  requiredAuth,
  allowRole("user"),
  uploadPicture,
  profileController.updateUserAvatar,
);

router.delete(
  "/me/avatar",
  rateLimiter(25, 10 * 60 * 1000),
  requiredAuth,
  allowRole("user"),
  profileController.removeUserAvatar,
);

/* Session routes */
router.get(
  "/me/sessions",
  generalApiLimiter(),
  requiredAuth,
  allowRole("user"),
  sessionController.getSessions,
);
router.delete(
  "/me/sessions/:id",
  generalApiLimiter(),
  requiredAuth,
  allowRole("user"),
  sessionController.removeSession,
);

/* Notification Route */
router.use("/me", requiredAuth, allowRole("user"), notificationRoutes);
router.use("/me", requiredAuth, allowRole("user"), favoritesRoutes);

/* Orders routes */
router.get(
  "/me/orders",
  generalApiLimiter(),
  requiredAuth,
  allowRole("user"),
  orderController.getAllOrders,
);
router.get(
  "/me/orders/:id",
  generalApiLimiter(),
  requiredAuth,
  allowRole("user"),
  orderController.getOrder,
);

/* Purchases routes */
router.get(
  "/me/purchases",
  generalApiLimiter(),
  requiredAuth,
  allowRole("user"),
  purchaseController.getAllPurchases,
);
router.get(
  "/me/purchases/:id",
  generalApiLimiter(),
  requiredAuth,
  allowRole("user"),
  purchaseController.getPurchase,
);

/* Cart routes */
router.use("/me", requiredAuth, allowRole("user"), cartRoutes);

/* Public user endpoints */
router.get("/:id", profileController.getUserPublicProfile);
router.get("/:id/favourites", profileController.getUserFavourites);

export default router;
