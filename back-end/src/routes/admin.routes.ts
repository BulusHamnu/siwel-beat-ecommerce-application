import { Router } from "express";
import { getDashboard } from "../controllers/admin.controller.js";
import requiredAuth from "../middlewares/requiredAuth.js";
import allowRole from "../middlewares/allowRole.js";
import * as ordersController from "../controllers/shared/orders.shared.controller.js";
import * as notificationController from "../controllers/shared/notification.controller.js";
import * as profileController from "../controllers/profile.controller.js";
import { uploadAvatar } from "../middlewares/upload.js";
import rateLimiter, {
  creationApiLimiter,
  generalApiLimiter,
} from "../middlewares/rateLimiter.js";
import * as sessionController from "../controllers/shared/session.controller.js";

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
  "/me/avatar",
  rateLimiter(20, 10 * 60 * 1000),
  uploadAvatar,
  profileController.updateProfileAvatar,
);

router.delete(
  "/me/avatar",
  rateLimiter(25, 10 * 60 * 1000),
  profileController.removeProfileAvatar,
);

/* Sessions routes */
router.get(
  "/me/sessions",
  generalApiLimiter(),
  requiredAuth,
  allowRole("admin"),
  sessionController.getSessions,
);

router.delete(
  "/me/sessions/:id",
  generalApiLimiter(),
  requiredAuth,
  allowRole("admin"),
  sessionController.removeSession,
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
  "/notifications/read-all",
  generalApiLimiter(),
  notificationController.readAllNotifications,
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
