import { Router } from "express";
import * as cartController from "../controller/cart.controller.js";
import { verifyToken, authorize } from "../middleware/auth.js";
import {
  validateAddCartItem,
  validateCartId,
  validateCartList,
  validateCartStatus,
  validateRemoveCartItem,
  validateUpdateCartItem,
} from "../validator/cart.validator.js";

const router = Router();

// Logged-in user (Shopping Cart page)
router.post("/cart/me", verifyToken, cartController.getMyCart);
router.post("/add", verifyToken, validateAddCartItem, cartController.addItem);
router.post(
  "/update",
  verifyToken,
  validateUpdateCartItem,
  cartController.updateQuantity,
);
router.post(
  "/remove",
  verifyToken,
  validateRemoveCartItem,
  cartController.removeItem,
);
router.post("/checkout", verifyToken, cartController.checkout);

// Admin only (Cart List page)
router.post(
  "/admin/list",
  verifyToken,
  authorize("admin"),
  validateCartList,
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
  validateCartId,
  validateCartStatus,
  cartController.updateStatus,
);
router.post(
  "/admin/delete/:id",
  verifyToken,
  authorize("admin"),
  validateCartId,
  cartController.remove,
);
router.post(
  "/admin/:id",
  verifyToken,
  authorize("admin"),
  validateCartId,
  cartController.getById,
);

export default router;

// In app.js:
//   import cartRoutes from "./routes/cart.routes.js";
//   app.use("/api", cartRoutes);
