import { Router } from "express";
import * as favouriteRoutes from "../../controllers/users/userFavourites.controller.js";
import {
  creationApiLimiter,
  generalApiLimiter,
} from "../../middlewares/rateLimiter.js";

const router = Router();

/* Favourites routes */
router.post(
  "/favourites",
  creationApiLimiter(),
  favouriteRoutes.addToUserFavourites,
);
router.get(
  "/favourites",
  generalApiLimiter(),
  favouriteRoutes.getUserFavourites,
);
router.delete(
  "/favourites",
  creationApiLimiter(),
  favouriteRoutes.removeFromFavourites,
);

export default router;
