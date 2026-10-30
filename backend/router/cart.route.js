import { Router } from "express";
import * as cartController from "../controller/cart.controller.js";
import { verifyToken, authorize } from "../middleware/auth.js";

const router = Router();

// Logged-in user (Shopping Cart page)
router.post("/cart/me", verifyToken, cartController.getMyCart);
router.post("/add", verifyToken, cartController.addItem);
router.post("/update", verifyToken, cartController.updateQuantity);
router.post("/remove", verifyToken, cartController.removeItem);
router.post("/checkout", verifyToken, cartController.checkout);

// Admin only (Cart List page)
router.post(
  "/admin/list",
  verifyToken,
  authorize("admin"),
  cartController.list,
);
router.post(
  "/admin/stats",
  verifyToken,
  authorize("admin"),
  cartController.stats,
);
router.post(
  "/admin/status/:id",
  verifyToken,
  authorize("admin"),
  cartController.updateStatus,
);
router.post(
  "/admin/delete/:id",
  verifyToken,
  authorize("admin"),
  cartController.remove,
);
router.post(
  "/admin/:id",
  verifyToken,
  authorize("admin"),
  cartController.getById,
);

export default router;

// In app.js:
//   import cartRoutes from "./routes/cart.routes.js";
//   app.use("/api", cartRoutes);
