import { Router } from "express";
import * as productController from "../controller/product.controller.js";
import { verifyToken, authorize } from "../middleware/auth.js";

import productUpload from "../middleware/productUpload.js";
import { uploadProductImage } from "../controller/product.controller.js";

const router = Router();

// Public (Shop page) - no login needed to browse
router.post("/product/list", productController.shopList);
router.post("/product/filters", productController.filters);

// Admin only (Product List page)
// NOTE: keep the /admin routes above "/product/:id" so "admin" is not read as an id
router.post(
  "/admin/list",
  verifyToken,
  authorize("admin"),
  productController.adminList,
);
router.post(
  "/admin/stats",
  verifyToken,
  authorize("admin"),
  productController.stats,
);

router.post(
  "/admin/create",
  verifyToken,
  authorize("admin"),
  productController.create,
);
router.post(
  "/admin/update/:id",
  verifyToken,
  authorize("admin"),
  productController.update,
);
router.post(
  "/admin/delete/:id",
  verifyToken,
  authorize("admin"),
  productController.remove,
);

router.post(
  "/admin/upload-image",
  verifyToken,
  authorize("admin"),
  productUpload.single("image"),
  uploadProductImage,
);

// Product details modal (public)
router.post("/product/:id", productController.getById);

export default router;
