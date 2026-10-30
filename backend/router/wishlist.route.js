import { Router } from "express";
import * as wishlistController from "../controller/wishlist.controller.js";
import { verifyToken, authorize } from "../middleware/auth.js";

const router = Router();

// Mounted in server.js as: app.use("/api/wishlist", wishlistRoutes)

// Logged-in customer (My Wishlist page, heart icons, header badge)
router.post("/me", verifyToken, wishlistController.getMyWishlist);
router.post("/add", verifyToken, wishlistController.add);
router.post("/toggle", verifyToken, wishlistController.toggle);
router.post("/remove", verifyToken, wishlistController.remove);
router.post("/clear", verifyToken, wishlistController.clear);
router.post("/count", verifyToken, wishlistController.count);

// Admin only
router.post(
  "/admin/list",
  verifyToken,
  authorize("admin"),
  wishlistController.list,
);
router.post(
  "/admin/stats",
  verifyToken,
  authorize("admin"),
  wishlistController.stats,
);
router.post(
  "/admin/user/:userId",
  verifyToken,
  authorize("admin"),
  wishlistController.getByUser,
);
router.post(
  "/admin/clear/:userId",
  verifyToken,
  authorize("admin"),
  wishlistController.clearByUser,
);
router.post(
  "/admin/delete/:id",
  verifyToken,
  authorize("admin"),
  wishlistController.removeById,
);

export default router;
