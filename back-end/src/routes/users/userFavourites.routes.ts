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
  favouriteRoutes.addToMyFavourites,
);

router.get("/favourites", generalApiLimiter(), favouriteRoutes.getMyFavourites);

router.delete(
  "/favourites",
  creationApiLimiter(),
  favouriteRoutes.removeFromFavourites,
);

export default router;
