import { Router } from "express";
import * as invoiceController from "../controller/invoice.controller.js";
import { verifyToken } from "../middleware/auth.js";

const router = Router();

const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }
  next();
};

// Admin invoice page ("/stats" must stay above anything with a param)
router.post("/stats", verifyToken, adminOnly, invoiceController.stats);
router.post("/all", verifyToken, adminOnly, invoiceController.list);

// Admin or the customer who owns the order   
router.post("/order/:orderId", verifyToken, invoiceController.getByOrder);

export default router;
