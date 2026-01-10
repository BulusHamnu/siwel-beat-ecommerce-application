import { Router } from "express";
import withAuth from "../../middlewares/withAuth.js";
import allowRole from "../../middlewares/allowRole.js";
import * as favouriteRoutes from "../../controllers/users/userFavourites.controller.js";

const router = Router();

/* Favourites routes */
router.post(
  "/favourites",
  withAuth,
  allowRole("user"),
  favouriteRoutes.addToUserFavourites
);
router.get(
  "/favourites",
  withAuth,
  allowRole("user"),
  favouriteRoutes.getUserFavourites
);
router.delete(
  "/favourites",
  withAuth,
  allowRole("user"),
  favouriteRoutes.removeFromFavourites
);

export default router;
