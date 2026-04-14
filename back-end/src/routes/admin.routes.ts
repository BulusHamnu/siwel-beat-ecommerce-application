import { Router } from "express";
import { getDashboard } from "../controllers/admin.controller.js";
import requiredAuth from "../middlewares/requiredAuth.js";
import allowRole from "../middlewares/allowRole.js";
import * as ordersController from "../controllers/shared/orders.shared.controller.js";
import * as notificationController from "../controllers/shared/notification.controller.js";
import * as profileController from "../controllers/profile.controller.js";
import { uploadPicture } from "../middlewares/upload.js";
import rateLimiter, {
  creationApiLimiter,
  generalApiLimiter,
} from "../middlewares/rateLimiter.js";

const router = Router();

router.use(requiredAuth);
router.use(allowRole("admin"));

/* Admin profile */
router.get(
  "/me",
  rateLimiter(20, 10 * 60 * 1000),
  profileController.getProfile,
);
router.patch("/me", creationApiLimiter(), profileController.updateProfile);
router.patch(
  "/me/picture",
  rateLimiter(20, 10 * 60 * 1000),
  uploadPicture,
  profileController.updateUserAvatar,
);

/* Dashboard routes */
router.get("/dashboard", generalApiLimiter(), getDashboard);

/* Notifications routes */
router.get(
  "/notifications",
  generalApiLimiter(),
  notificationController.getAllNotifications,
);
router.get(
  "/notifications/:id",
  generalApiLimiter(),
  notificationController.getNotification,
);

router.patch(
  "/notifications/:id",
  generalApiLimiter(),
  notificationController.updateNotificationStatus,
);

router.patch(
  "/notifications/:id",
  generalApiLimiter(),
  notificationController.updateNotificationStatus,
);

router.delete(
  "/notifications/:id",
  generalApiLimiter(),
  notificationController.deleteNotification,
);

/* Orders routes */
router.get("/orders", generalApiLimiter(), ordersController.getAllOrders); // Issue here
router.get("/orders/:id", generalApiLimiter(), ordersController.getOrder);

export default router;
