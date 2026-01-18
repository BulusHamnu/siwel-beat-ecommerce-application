import { Router } from "express";
import * as favouriteRoutes from "../../controllers/users/userFavourites.controller.js";

const router = Router();

/* Favourites routes */
router.post("/favourites", favouriteRoutes.addToUserFavourites);
router.get("/favourites", favouriteRoutes.getUserFavourites);
router.delete("/favourites", favouriteRoutes.removeFromFavourites);

export default router;
