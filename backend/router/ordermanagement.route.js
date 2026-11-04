import { Router } from "express";
import * as orderController from "../controller/ordermanagement.controller.js";
import { verifyToken, authorize } from "../middleware/auth.js";
import {
  validateCreateOrder,
  validateOrderId,
  validateOrderList,
  validateOrderUpdate,
} from "../validator/order.validator.js";

const router = Router();

// Checkout (logged-in users only)
router.post("/", verifyToken, validateCreateOrder, orderController.create);

// Logged-in customer
router.post("/my", verifyToken, orderController.myOrders);

// Admin only (Order Management page)
router.post(
  "/list",
  verifyToken,
  authorize("admin"),
  validateOrderList,
  orderController.list,
);
router.post("/stats", verifyToken, authorize("admin"), orderController.stats);
router.post(
  "/delete/:id",
  verifyToken,
  authorize("admin"),
  validateOrderId,
  orderController.remove,
);
router.post(
  "/update/:id",
  verifyToken,
  authorize("admin"),
  validateOrderId,
  validateOrderUpdate,
  orderController.update,
);

// Admin or the customer who owns the order
router.post("/:id", verifyToken, validateOrderId, orderController.getById);

export default router;
