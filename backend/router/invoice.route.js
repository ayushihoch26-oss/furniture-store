import { Router } from "express";
import * as invoiceController from "../controller/invoice.controller.js";
import { verifyToken } from "../middleware/auth.js";
import {
  validateInvoiceList,
  validateInvoiceOrderId,
} from "../validator/invoice.validator.js";

const router = Router();

const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }
  next();
};

// Admin invoice page ("/stats" must stay above anything with a param)
router.post("/stats", verifyToken, adminOnly, invoiceController.stats);
router.post(
  "/all",
  verifyToken,
  adminOnly,
  validateInvoiceList,
  invoiceController.list,
);

// Admin or the customer who owns the order   
router.post(
  "/order/:orderId",
  verifyToken,
  validateInvoiceOrderId,
  invoiceController.getByOrder,
);

export default router;
